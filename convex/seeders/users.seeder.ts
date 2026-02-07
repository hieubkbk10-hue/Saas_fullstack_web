/**
 * Users Seeder
 */

import { BaseSeeder, type SeedConfig, type SeedDependency } from './base';
import type { Doc, DataModel } from '../_generated/dataModel';
import type { GenericMutationCtx } from 'convex/server';

type UserData = Omit<Doc<'users'>, '_creationTime' | '_id'>;

const DEFAULT_USERS: Array<{ email: string; name: string; status: UserData['status'] }> = [
  { email: 'superadmin@example.com', name: 'Super Admin', status: 'Active' as const },
  { email: 'admin@example.com', name: 'Admin User', status: 'Active' as const },
  { email: 'editor@example.com', name: 'Nguyễn Văn Editor', status: 'Active' as const },
  { email: 'mod@example.com', name: 'Trần Thị Moderator', status: 'Active' as const },
];

export class UsersSeeder extends BaseSeeder<UserData> {
  moduleName = 'users';
  tableName = 'users';
  dependencies: SeedDependency[] = [{ module: 'roles', minRecords: 1, required: true }];

  private roles: Doc<'roles'>[] = [];
  private userIndex = 0;

  constructor(ctx: GenericMutationCtx<DataModel>) {
    super(ctx);
  }

  async seed(config: SeedConfig) {
    this.roles = await this.ctx.db.query('roles').collect();
    if (this.roles.length === 0) {
      throw new Error('No roles found. Seed roles first.');
    }

    await this.seedModuleConfig();
    return super.seed(config);
  }

  generateFake(): UserData {
    const role = this.pickRoleForIndex(this.userIndex);
    const status = this.faker.helpers.weightedArrayElement([
      { value: 'Active' as const, weight: 7 },
      { value: 'Inactive' as const, weight: 2 },
      { value: 'Banned' as const, weight: 1 },
    ]);

    let baseUser = DEFAULT_USERS[this.userIndex];
    this.userIndex += 1;

    if (!baseUser) {
      baseUser = {
        email: this.faker.internet.email().toLowerCase(),
        name: this.faker.person.fullName(),
        status,
      };
    }

    return {
      avatar: this.randomBoolean(0.6) ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${baseUser.email}` : undefined,
      email: baseUser.email,
      lastLogin: this.randomBoolean(0.7) ? Date.now() - this.randomInt(1, 15) * 60 * 60 * 1000 : undefined,
      name: baseUser.name,
      phone: this.randomBoolean(0.6) ? `09${this.faker.string.numeric(8)}` : undefined,
      roleId: role._id,
      status: baseUser.status,
    };
  }

  validateRecord(record: UserData): boolean {
    return !!record.email && !!record.name && !!record.roleId;
  }

  protected async afterSeed(count: number): Promise<void> {
    void count;
    const [existingUserStats, existingRoleStats] = await Promise.all([
      this.ctx.db.query('userStats').collect(),
      this.ctx.db.query('roleStats').collect(),
    ]);
    await Promise.all([
      ...existingUserStats.map(stat => this.ctx.db.delete(stat._id)),
      ...existingRoleStats.map(stat => this.ctx.db.delete(stat._id)),
    ]);

    const users = await this.ctx.db.query('users').collect();
    const statusCounts: Record<string, number> = { Active: 0, Banned: 0, Inactive: 0 };
    users.forEach(user => { statusCounts[user.status] = (statusCounts[user.status] || 0) + 1; });

    const roles = await this.ctx.db.query('roles').collect();
    const systemCount = roles.filter(role => role.isSystem).length;
    const superAdminCount = roles.filter(role => role.isSuperAdmin).length;

    await Promise.all([
      this.ctx.db.insert('userStats', { count: users.length, key: 'total' }),
      this.ctx.db.insert('userStats', { count: statusCounts.Active, key: 'Active' }),
      this.ctx.db.insert('userStats', { count: statusCounts.Inactive, key: 'Inactive' }),
      this.ctx.db.insert('userStats', { count: statusCounts.Banned, key: 'Banned' }),
      this.ctx.db.insert('roleStats', { count: roles.length, key: 'total' }),
      this.ctx.db.insert('roleStats', { count: systemCount, key: 'system' }),
      this.ctx.db.insert('roleStats', { count: superAdminCount, key: 'superAdmin' }),
    ]);
  }

  private pickRoleForIndex(index: number): Doc<'roles'> {
    const ordered = [...this.roles].sort((a, b) => a.name.localeCompare(b.name));
    return ordered[index % ordered.length];
  }

  private async seedModuleConfig(): Promise<void> {
    const existingFeatures = await this.ctx.db
      .query('moduleFeatures')
      .withIndex('by_module', q => q.eq('moduleKey', 'users'))
      .first();
    if (!existingFeatures) {
      const features = [
        { description: 'Cho phép user có ảnh đại diện', enabled: true, featureKey: 'enableAvatar', linkedFieldKey: 'avatar', moduleKey: 'users', name: 'Ảnh đại diện' },
        { description: 'Lưu số điện thoại của user', enabled: true, featureKey: 'enablePhone', linkedFieldKey: 'phone', moduleKey: 'users', name: 'Số điện thoại' },
        { description: 'Theo dõi lần đăng nhập cuối', enabled: true, featureKey: 'enableLastLogin', linkedFieldKey: 'lastLogin', moduleKey: 'users', name: 'Đăng nhập cuối' },
      ];
      await Promise.all(features.map(feature => this.ctx.db.insert('moduleFeatures', feature)));
    }

    const existingFields = await this.ctx.db
      .query('moduleFields')
      .withIndex('by_module', q => q.eq('moduleKey', 'users'))
      .first();
    if (!existingFields) {
      const fields = [
        { enabled: true, fieldKey: 'name', isSystem: true, moduleKey: 'users', name: 'Họ và tên', order: 0, required: true, type: 'text' as const },
        { enabled: true, fieldKey: 'email', isSystem: true, moduleKey: 'users', name: 'Email', order: 1, required: true, type: 'email' as const },
        { enabled: true, fieldKey: 'roleId', isSystem: true, moduleKey: 'users', name: 'Vai trò', order: 2, required: true, type: 'select' as const },
        { enabled: true, fieldKey: 'status', isSystem: true, moduleKey: 'users', name: 'Trạng thái', order: 3, required: true, type: 'select' as const },
        { enabled: true, fieldKey: 'phone', isSystem: false, linkedFeature: 'enablePhone', moduleKey: 'users', name: 'Số điện thoại', order: 4, required: false, type: 'phone' as const },
        { enabled: true, fieldKey: 'avatar', isSystem: false, linkedFeature: 'enableAvatar', moduleKey: 'users', name: 'Ảnh đại diện', order: 5, required: false, type: 'image' as const },
        { enabled: true, fieldKey: 'lastLogin', isSystem: false, linkedFeature: 'enableLastLogin', moduleKey: 'users', name: 'Đăng nhập cuối', order: 6, required: false, type: 'date' as const },
      ];
      await Promise.all(fields.map(field => this.ctx.db.insert('moduleFields', field)));
    }

    const existingSettings = await this.ctx.db
      .query('moduleSettings')
      .withIndex('by_module', q => q.eq('moduleKey', 'users'))
      .first();
    if (!existingSettings) {
      await Promise.all([
        this.ctx.db.insert('moduleSettings', { moduleKey: 'users', settingKey: 'usersPerPage', value: 20 }),
        this.ctx.db.insert('moduleSettings', { moduleKey: 'users', settingKey: 'sessionTimeout', value: 30 }),
        this.ctx.db.insert('moduleSettings', { moduleKey: 'users', settingKey: 'maxLoginAttempts', value: 5 }),
      ]);
    }
  }
}
