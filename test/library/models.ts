import sequelize, {
  Sequelize,

  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  HasOneCreateAssociationMixin,

  HasManyCountAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyCreateAssociationMixin,

  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,

  BelongsToManyCountAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
} from 'sequelize';
import { Overwrite, ExtendedModel } from 'az-model-manager';

// ============== start model: AccountLink ==============
export type AccountLinkCreationAttributes = {
  provider_id?: string;
  provider_user_id?: string;
  provider_user_access_info?: any;
  data?: any;
  user?: UserCreationAttributes;
  recoveryToken?: RecoveryTokenCreationAttributes;
  user_id?: string;
};

export type AccountLinkAttributes = {
  id: string;
  provider_id?: string;
  provider_user_id?: string;
  provider_user_access_info?: any;
  data?: any;
  user?: ExtendedModel<UserI>;
  recoveryToken?: ExtendedModel<RecoveryTokenI>;
  user_id?: string;
};

export type AccountLinkI = AccountLinkAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: user
  getUser: BelongsToGetAssociationMixin<UserI>;
  setUser: BelongsToSetAssociationMixin<UserI, string>;
  createUser: BelongsToCreateAssociationMixin<UserI>;

  // association: recoveryToken
  getRecoveryToken: HasOneGetAssociationMixin<RecoveryTokenI>;
  setRecoveryToken: HasOneSetAssociationMixin<RecoveryTokenI, string>;
  createRecoveryToken: HasOneCreateAssociationMixin<RecoveryTokenI>;
};
// ============== end model: AccountLink ==============

// ============== start model: User ==============
export type UserCreationAttributes = {
  name?: string;
  type?: string;
  privilege?: string;
  labels?: any;
  picture?: string;
  data?: any;
  managedBy?: OrganizationCreationAttributes;
  userGroups?: UserGroupCreationAttributes[];
  groupInvitations?: UserGroupCreationAttributes[];
  invitedGroupUsers?: UserGroupCreationAttributes[];
  organizations?: OrganizationCreationAttributes[];
  organizationInvitations?: OrganizationCreationAttributes[];
  invitedOrganizationUsers?: OrganizationCreationAttributes[];
  projects?: ProjectCreationAttributes[];
  projectInvitations?: ProjectCreationAttributes[];
  invitedProjectUsers?: ProjectCreationAttributes[];
  org_mgr_id?: string;
  memos?: MemoCreationAttributes[];
  accountLinks?: AccountLinkCreationAttributes[];
  userSettings?: UserSettingCreationAttributes[];
  leftMessages?: ContactUsMessageCreationAttributes[];
  assignedMessage?: ContactUsMessageCreationAttributes[];
  ordererInfos?: OrdererInfoCreationAttributes[];
  defaultOrdererInfo?: OrdererInfoCreationAttributes;
  recipientInfos?: RecipientInfoCreationAttributes[];
  defaultRecipientInfo?: RecipientInfoCreationAttributes;
  orders?: OrderCreationAttributes[];
  subscriptionOrders?: SubscriptionOrderCreationAttributes[];
};

export type UserAttributes = {
  id: string;
  name?: string;
  type?: string;
  privilege?: string;
  labels?: any;
  picture?: string;
  data?: any;
  managedBy?: ExtendedModel<OrganizationI>;
  userGroups?: ExtendedModel<UserGroupI>[];
  groupInvitations?: ExtendedModel<UserGroupI>[];
  invitedGroupUsers?: ExtendedModel<UserGroupI>[];
  organizations?: ExtendedModel<OrganizationI>[];
  organizationInvitations?: ExtendedModel<OrganizationI>[];
  invitedOrganizationUsers?: ExtendedModel<OrganizationI>[];
  projects?: ExtendedModel<ProjectI>[];
  projectInvitations?: ExtendedModel<ProjectI>[];
  invitedProjectUsers?: ExtendedModel<ProjectI>[];
  org_mgr_id?: string;
  memos?: ExtendedModel<MemoI>[];
  accountLinks?: ExtendedModel<AccountLinkI>[];
  userSettings?: ExtendedModel<UserSettingI>[];
  leftMessages?: ExtendedModel<ContactUsMessageI>[];
  assignedMessage?: ExtendedModel<ContactUsMessageI>[];
  ordererInfos?: ExtendedModel<OrdererInfoI>[];
  defaultOrdererInfo?: ExtendedModel<OrdererInfoI>;
  recipientInfos?: ExtendedModel<RecipientInfoI>[];
  defaultRecipientInfo?: ExtendedModel<RecipientInfoI>;
  orders?: ExtendedModel<OrderI>[];
  subscriptionOrders?: ExtendedModel<SubscriptionOrderI>[];
};

export type UserI = UserAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: managedBy
  getManagedBy: BelongsToGetAssociationMixin<OrganizationI>;
  setManagedBy: BelongsToSetAssociationMixin<OrganizationI, string>;
  createManagedBy: BelongsToCreateAssociationMixin<OrganizationI>;

  // association: userGroups
  countUserGroups: BelongsToManyCountAssociationsMixin;
  hasUserGroup: BelongsToManyHasAssociationMixin<UserGroupI, string>;
  hasUserGroups: BelongsToManyHasAssociationsMixin<UserGroupI, string>;
  getUserGroups: BelongsToManyGetAssociationsMixin<UserGroupI>;
  setUserGroups: BelongsToManySetAssociationsMixin<UserGroupI, string>;
  addUserGroup: BelongsToManyAddAssociationMixin<UserGroupI, string>;
  addUserGroups: BelongsToManyAddAssociationsMixin<UserGroupI, string>;
  removeUserGroup: BelongsToManyRemoveAssociationMixin<UserGroupI, string>;
  removeUserGroups: BelongsToManyRemoveAssociationsMixin<UserGroupI, string>;
  createUserGroup: BelongsToManyCreateAssociationMixin<UserGroupI>;


  // association: groupInvitations
  countGroupInvitations: BelongsToManyCountAssociationsMixin;
  hasGroupInvitation: BelongsToManyHasAssociationMixin<UserGroupI, string>;
  hasGroupInvitations: BelongsToManyHasAssociationsMixin<UserGroupI, string>;
  getGroupInvitations: BelongsToManyGetAssociationsMixin<UserGroupI>;
  setGroupInvitations: BelongsToManySetAssociationsMixin<UserGroupI, string>;
  addGroupInvitation: BelongsToManyAddAssociationMixin<UserGroupI, string>;
  addGroupInvitations: BelongsToManyAddAssociationsMixin<UserGroupI, string>;
  removeGroupInvitation: BelongsToManyRemoveAssociationMixin<UserGroupI, string>;
  removeGroupInvitations: BelongsToManyRemoveAssociationsMixin<UserGroupI, string>;
  createGroupInvitation: BelongsToManyCreateAssociationMixin<UserGroupI>;


  // association: invitedGroupUsers
  countInvitedGroupUsers: BelongsToManyCountAssociationsMixin;
  hasInvitedGroupUser: BelongsToManyHasAssociationMixin<UserGroupI, string>;
  hasInvitedGroupUsers: BelongsToManyHasAssociationsMixin<UserGroupI, string>;
  getInvitedGroupUsers: BelongsToManyGetAssociationsMixin<UserGroupI>;
  setInvitedGroupUsers: BelongsToManySetAssociationsMixin<UserGroupI, string>;
  addInvitedGroupUser: BelongsToManyAddAssociationMixin<UserGroupI, string>;
  addInvitedGroupUsers: BelongsToManyAddAssociationsMixin<UserGroupI, string>;
  removeInvitedGroupUser: BelongsToManyRemoveAssociationMixin<UserGroupI, string>;
  removeInvitedGroupUsers: BelongsToManyRemoveAssociationsMixin<UserGroupI, string>;
  createInvitedGroupUser: BelongsToManyCreateAssociationMixin<UserGroupI>;


  // association: organizations
  countOrganizations: BelongsToManyCountAssociationsMixin;
  hasOrganization: BelongsToManyHasAssociationMixin<OrganizationI, string>;
  hasOrganizations: BelongsToManyHasAssociationsMixin<OrganizationI, string>;
  getOrganizations: BelongsToManyGetAssociationsMixin<OrganizationI>;
  setOrganizations: BelongsToManySetAssociationsMixin<OrganizationI, string>;
  addOrganization: BelongsToManyAddAssociationMixin<OrganizationI, string>;
  addOrganizations: BelongsToManyAddAssociationsMixin<OrganizationI, string>;
  removeOrganization: BelongsToManyRemoveAssociationMixin<OrganizationI, string>;
  removeOrganizations: BelongsToManyRemoveAssociationsMixin<OrganizationI, string>;
  createOrganization: BelongsToManyCreateAssociationMixin<OrganizationI>;


  // association: organizationInvitations
  countOrganizationInvitations: BelongsToManyCountAssociationsMixin;
  hasOrganizationInvitation: BelongsToManyHasAssociationMixin<OrganizationI, string>;
  hasOrganizationInvitations: BelongsToManyHasAssociationsMixin<OrganizationI, string>;
  getOrganizationInvitations: BelongsToManyGetAssociationsMixin<OrganizationI>;
  setOrganizationInvitations: BelongsToManySetAssociationsMixin<OrganizationI, string>;
  addOrganizationInvitation: BelongsToManyAddAssociationMixin<OrganizationI, string>;
  addOrganizationInvitations: BelongsToManyAddAssociationsMixin<OrganizationI, string>;
  removeOrganizationInvitation: BelongsToManyRemoveAssociationMixin<OrganizationI, string>;
  removeOrganizationInvitations: BelongsToManyRemoveAssociationsMixin<OrganizationI, string>;
  createOrganizationInvitation: BelongsToManyCreateAssociationMixin<OrganizationI>;


  // association: invitedOrganizationUsers
  countInvitedOrganizationUsers: BelongsToManyCountAssociationsMixin;
  hasInvitedOrganizationUser: BelongsToManyHasAssociationMixin<OrganizationI, string>;
  hasInvitedOrganizationUsers: BelongsToManyHasAssociationsMixin<OrganizationI, string>;
  getInvitedOrganizationUsers: BelongsToManyGetAssociationsMixin<OrganizationI>;
  setInvitedOrganizationUsers: BelongsToManySetAssociationsMixin<OrganizationI, string>;
  addInvitedOrganizationUser: BelongsToManyAddAssociationMixin<OrganizationI, string>;
  addInvitedOrganizationUsers: BelongsToManyAddAssociationsMixin<OrganizationI, string>;
  removeInvitedOrganizationUser: BelongsToManyRemoveAssociationMixin<OrganizationI, string>;
  removeInvitedOrganizationUsers: BelongsToManyRemoveAssociationsMixin<OrganizationI, string>;
  createInvitedOrganizationUser: BelongsToManyCreateAssociationMixin<OrganizationI>;


  // association: projects
  countProjects: BelongsToManyCountAssociationsMixin;
  hasProject: BelongsToManyHasAssociationMixin<ProjectI, string>;
  hasProjects: BelongsToManyHasAssociationsMixin<ProjectI, string>;
  getProjects: BelongsToManyGetAssociationsMixin<ProjectI>;
  setProjects: BelongsToManySetAssociationsMixin<ProjectI, string>;
  addProject: BelongsToManyAddAssociationMixin<ProjectI, string>;
  addProjects: BelongsToManyAddAssociationsMixin<ProjectI, string>;
  removeProject: BelongsToManyRemoveAssociationMixin<ProjectI, string>;
  removeProjects: BelongsToManyRemoveAssociationsMixin<ProjectI, string>;
  createProject: BelongsToManyCreateAssociationMixin<ProjectI>;


  // association: projectInvitations
  countProjectInvitations: BelongsToManyCountAssociationsMixin;
  hasProjectInvitation: BelongsToManyHasAssociationMixin<ProjectI, string>;
  hasProjectInvitations: BelongsToManyHasAssociationsMixin<ProjectI, string>;
  getProjectInvitations: BelongsToManyGetAssociationsMixin<ProjectI>;
  setProjectInvitations: BelongsToManySetAssociationsMixin<ProjectI, string>;
  addProjectInvitation: BelongsToManyAddAssociationMixin<ProjectI, string>;
  addProjectInvitations: BelongsToManyAddAssociationsMixin<ProjectI, string>;
  removeProjectInvitation: BelongsToManyRemoveAssociationMixin<ProjectI, string>;
  removeProjectInvitations: BelongsToManyRemoveAssociationsMixin<ProjectI, string>;
  createProjectInvitation: BelongsToManyCreateAssociationMixin<ProjectI>;


  // association: invitedProjectUsers
  countInvitedProjectUsers: BelongsToManyCountAssociationsMixin;
  hasInvitedProjectUser: BelongsToManyHasAssociationMixin<ProjectI, string>;
  hasInvitedProjectUsers: BelongsToManyHasAssociationsMixin<ProjectI, string>;
  getInvitedProjectUsers: BelongsToManyGetAssociationsMixin<ProjectI>;
  setInvitedProjectUsers: BelongsToManySetAssociationsMixin<ProjectI, string>;
  addInvitedProjectUser: BelongsToManyAddAssociationMixin<ProjectI, string>;
  addInvitedProjectUsers: BelongsToManyAddAssociationsMixin<ProjectI, string>;
  removeInvitedProjectUser: BelongsToManyRemoveAssociationMixin<ProjectI, string>;
  removeInvitedProjectUsers: BelongsToManyRemoveAssociationsMixin<ProjectI, string>;
  createInvitedProjectUser: BelongsToManyCreateAssociationMixin<ProjectI>;


  // association: memos
  countMemos: BelongsToManyCountAssociationsMixin;
  hasMemo: BelongsToManyHasAssociationMixin<MemoI, string>;
  hasMemos: BelongsToManyHasAssociationsMixin<MemoI, string>;
  getMemos: BelongsToManyGetAssociationsMixin<MemoI>;
  setMemos: BelongsToManySetAssociationsMixin<MemoI, string>;
  addMemo: BelongsToManyAddAssociationMixin<MemoI, string>;
  addMemos: BelongsToManyAddAssociationsMixin<MemoI, string>;
  removeMemo: BelongsToManyRemoveAssociationMixin<MemoI, string>;
  removeMemos: BelongsToManyRemoveAssociationsMixin<MemoI, string>;
  createMemo: BelongsToManyCreateAssociationMixin<MemoI>;


  // association: accountLinks
  countAccountLinks: HasManyCountAssociationsMixin;
  hasAccountLink: HasManyHasAssociationMixin<AccountLinkI, string>;
  hasAccountLinks: HasManyHasAssociationsMixin<AccountLinkI, string>;
  getAccountLinks: HasManyGetAssociationsMixin<AccountLinkI>;
  setAccountLinks: HasManySetAssociationsMixin<AccountLinkI, string>;
  addAccountLink: HasManyAddAssociationMixin<AccountLinkI, string>;
  addAccountLinks: HasManyAddAssociationsMixin<AccountLinkI, string>;
  removeAccountLink: HasManyRemoveAssociationMixin<AccountLinkI, string>;
  removeAccountLinks: HasManyRemoveAssociationsMixin<AccountLinkI, string>;
  createAccountLink: HasManyCreateAssociationMixin<AccountLinkI>;

  // association: userSettings
  countUserSettings: HasManyCountAssociationsMixin;
  hasUserSetting: HasManyHasAssociationMixin<UserSettingI, string>;
  hasUserSettings: HasManyHasAssociationsMixin<UserSettingI, string>;
  getUserSettings: HasManyGetAssociationsMixin<UserSettingI>;
  setUserSettings: HasManySetAssociationsMixin<UserSettingI, string>;
  addUserSetting: HasManyAddAssociationMixin<UserSettingI, string>;
  addUserSettings: HasManyAddAssociationsMixin<UserSettingI, string>;
  removeUserSetting: HasManyRemoveAssociationMixin<UserSettingI, string>;
  removeUserSettings: HasManyRemoveAssociationsMixin<UserSettingI, string>;
  createUserSetting: HasManyCreateAssociationMixin<UserSettingI>;

  // association: leftMessages
  countLeftMessages: HasManyCountAssociationsMixin;
  hasLeftMessage: HasManyHasAssociationMixin<ContactUsMessageI, string>;
  hasLeftMessages: HasManyHasAssociationsMixin<ContactUsMessageI, string>;
  getLeftMessages: HasManyGetAssociationsMixin<ContactUsMessageI>;
  setLeftMessages: HasManySetAssociationsMixin<ContactUsMessageI, string>;
  addLeftMessage: HasManyAddAssociationMixin<ContactUsMessageI, string>;
  addLeftMessages: HasManyAddAssociationsMixin<ContactUsMessageI, string>;
  removeLeftMessage: HasManyRemoveAssociationMixin<ContactUsMessageI, string>;
  removeLeftMessages: HasManyRemoveAssociationsMixin<ContactUsMessageI, string>;
  createLeftMessage: HasManyCreateAssociationMixin<ContactUsMessageI>;

  // association: assignedMessage
  countAssignedMessages: HasManyCountAssociationsMixin;
  hasAssignedMessage: HasManyHasAssociationMixin<ContactUsMessageI, string>;
  hasAssignedMessages: HasManyHasAssociationsMixin<ContactUsMessageI, string>;
  getAssignedMessages: HasManyGetAssociationsMixin<ContactUsMessageI>;
  setAssignedMessages: HasManySetAssociationsMixin<ContactUsMessageI, string>;
  addAssignedMessage: HasManyAddAssociationMixin<ContactUsMessageI, string>;
  addAssignedMessages: HasManyAddAssociationsMixin<ContactUsMessageI, string>;
  removeAssignedMessage: HasManyRemoveAssociationMixin<ContactUsMessageI, string>;
  removeAssignedMessages: HasManyRemoveAssociationsMixin<ContactUsMessageI, string>;
  createAssignedMessage: HasManyCreateAssociationMixin<ContactUsMessageI>;

  // association: ordererInfos
  countOrdererInfos: HasManyCountAssociationsMixin;
  hasOrdererInfo: HasManyHasAssociationMixin<OrdererInfoI, string>;
  hasOrdererInfos: HasManyHasAssociationsMixin<OrdererInfoI, string>;
  getOrdererInfos: HasManyGetAssociationsMixin<OrdererInfoI>;
  setOrdererInfos: HasManySetAssociationsMixin<OrdererInfoI, string>;
  addOrdererInfo: HasManyAddAssociationMixin<OrdererInfoI, string>;
  addOrdererInfos: HasManyAddAssociationsMixin<OrdererInfoI, string>;
  removeOrdererInfo: HasManyRemoveAssociationMixin<OrdererInfoI, string>;
  removeOrdererInfos: HasManyRemoveAssociationsMixin<OrdererInfoI, string>;
  createOrdererInfo: HasManyCreateAssociationMixin<OrdererInfoI>;

  // association: defaultOrdererInfo
  getDefaultOrdererInfo: HasOneGetAssociationMixin<OrdererInfoI>;
  setDefaultOrdererInfo: HasOneSetAssociationMixin<OrdererInfoI, string>;
  createDefaultOrdererInfo: HasOneCreateAssociationMixin<OrdererInfoI>;

  // association: recipientInfos
  countRecipientInfos: HasManyCountAssociationsMixin;
  hasRecipientInfo: HasManyHasAssociationMixin<RecipientInfoI, string>;
  hasRecipientInfos: HasManyHasAssociationsMixin<RecipientInfoI, string>;
  getRecipientInfos: HasManyGetAssociationsMixin<RecipientInfoI>;
  setRecipientInfos: HasManySetAssociationsMixin<RecipientInfoI, string>;
  addRecipientInfo: HasManyAddAssociationMixin<RecipientInfoI, string>;
  addRecipientInfos: HasManyAddAssociationsMixin<RecipientInfoI, string>;
  removeRecipientInfo: HasManyRemoveAssociationMixin<RecipientInfoI, string>;
  removeRecipientInfos: HasManyRemoveAssociationsMixin<RecipientInfoI, string>;
  createRecipientInfo: HasManyCreateAssociationMixin<RecipientInfoI>;

  // association: defaultRecipientInfo
  getDefaultRecipientInfo: HasOneGetAssociationMixin<RecipientInfoI>;
  setDefaultRecipientInfo: HasOneSetAssociationMixin<RecipientInfoI, string>;
  createDefaultRecipientInfo: HasOneCreateAssociationMixin<RecipientInfoI>;

  // association: orders
  countOrders: HasManyCountAssociationsMixin;
  hasOrder: HasManyHasAssociationMixin<OrderI, string>;
  hasOrders: HasManyHasAssociationsMixin<OrderI, string>;
  getOrders: HasManyGetAssociationsMixin<OrderI>;
  setOrders: HasManySetAssociationsMixin<OrderI, string>;
  addOrder: HasManyAddAssociationMixin<OrderI, string>;
  addOrders: HasManyAddAssociationsMixin<OrderI, string>;
  removeOrder: HasManyRemoveAssociationMixin<OrderI, string>;
  removeOrders: HasManyRemoveAssociationsMixin<OrderI, string>;
  createOrder: HasManyCreateAssociationMixin<OrderI>;

  // association: subscriptionOrders
  countSubscriptionOrders: HasManyCountAssociationsMixin;
  hasSubscriptionOrder: HasManyHasAssociationMixin<SubscriptionOrderI, string>;
  hasSubscriptionOrders: HasManyHasAssociationsMixin<SubscriptionOrderI, string>;
  getSubscriptionOrders: HasManyGetAssociationsMixin<SubscriptionOrderI>;
  setSubscriptionOrders: HasManySetAssociationsMixin<SubscriptionOrderI, string>;
  addSubscriptionOrder: HasManyAddAssociationMixin<SubscriptionOrderI, string>;
  addSubscriptionOrders: HasManyAddAssociationsMixin<SubscriptionOrderI, string>;
  removeSubscriptionOrder: HasManyRemoveAssociationMixin<SubscriptionOrderI, string>;
  removeSubscriptionOrders: HasManyRemoveAssociationsMixin<SubscriptionOrderI, string>;
  createSubscriptionOrder: HasManyCreateAssociationMixin<SubscriptionOrderI>;
};
// ============== end model: User ==============

// ============== start model: UserSetting ==============
export type UserSettingCreationAttributes = {
  type?: string;
  data?: any;
  user?: UserCreationAttributes;
  user_id?: string;
  exData?: UserMemoExCreationAttributes;
};

export type UserSettingAttributes = {
  id: string;
  type?: string;
  data?: any;
  user?: ExtendedModel<UserI>;
  user_id?: string;
  exData?: ExtendedModel<UserMemoExI>;
};

export type UserSettingI = UserSettingAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: user
  getUser: BelongsToGetAssociationMixin<UserI>;
  setUser: BelongsToSetAssociationMixin<UserI, string>;
  createUser: BelongsToCreateAssociationMixin<UserI>;

  // association: exData
  getExData: HasOneGetAssociationMixin<UserMemoExI>;
  setExData: HasOneSetAssociationMixin<UserMemoExI, string>;
  createExData: HasOneCreateAssociationMixin<UserMemoExI>;
};
// ============== end model: UserSetting ==============

// ============== start model: Log ==============
export type LogCreationAttributes = {
  type?: string;
  data?: any;
};

export type LogAttributes = {
  type?: string;
  data?: any;
};

export type LogI = LogAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;
};
// ============== end model: Log ==============

// ============== start model: RecoveryToken ==============
export type RecoveryTokenCreationAttributes = {
  type?: string;
  key?: string;
  token?: string;
  accountLink?: AccountLinkCreationAttributes;
  account_link_id?: string;
};

export type RecoveryTokenAttributes = {
  id: string;
  type?: string;
  key?: string;
  token?: string;
  accountLink?: ExtendedModel<AccountLinkI>;
  account_link_id?: string;
};

export type RecoveryTokenI = RecoveryTokenAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: accountLink
  getAccountLink: BelongsToGetAssociationMixin<AccountLinkI>;
  setAccountLink: BelongsToSetAssociationMixin<AccountLinkI, string>;
  createAccountLink: BelongsToCreateAssociationMixin<AccountLinkI>;
};
// ============== end model: RecoveryToken ==============

// ============== start model: UserGroup ==============
export type UserGroupCreationAttributes = {
  name?: string;
  users?: UserCreationAttributes[];
  inviters?: UserCreationAttributes[];
  invitees?: UserCreationAttributes[];
};

export type UserGroupAttributes = {
  id: string;
  name?: string;
  users?: ExtendedModel<UserI>[];
  inviters?: ExtendedModel<UserI>[];
  invitees?: ExtendedModel<UserI>[];
};

export type UserGroupI = UserGroupAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: users
  countUsers: BelongsToManyCountAssociationsMixin;
  hasUser: BelongsToManyHasAssociationMixin<UserI, string>;
  hasUsers: BelongsToManyHasAssociationsMixin<UserI, string>;
  getUsers: BelongsToManyGetAssociationsMixin<UserI>;
  setUsers: BelongsToManySetAssociationsMixin<UserI, string>;
  addUser: BelongsToManyAddAssociationMixin<UserI, string>;
  addUsers: BelongsToManyAddAssociationsMixin<UserI, string>;
  removeUser: BelongsToManyRemoveAssociationMixin<UserI, string>;
  removeUsers: BelongsToManyRemoveAssociationsMixin<UserI, string>;
  createUser: BelongsToManyCreateAssociationMixin<UserI>;


  // association: inviters
  countInviters: BelongsToManyCountAssociationsMixin;
  hasInviter: BelongsToManyHasAssociationMixin<UserI, string>;
  hasInviters: BelongsToManyHasAssociationsMixin<UserI, string>;
  getInviters: BelongsToManyGetAssociationsMixin<UserI>;
  setInviters: BelongsToManySetAssociationsMixin<UserI, string>;
  addInviter: BelongsToManyAddAssociationMixin<UserI, string>;
  addInviters: BelongsToManyAddAssociationsMixin<UserI, string>;
  removeInviter: BelongsToManyRemoveAssociationMixin<UserI, string>;
  removeInviters: BelongsToManyRemoveAssociationsMixin<UserI, string>;
  createInviter: BelongsToManyCreateAssociationMixin<UserI>;


  // association: invitees
  countInvitees: BelongsToManyCountAssociationsMixin;
  hasInvitee: BelongsToManyHasAssociationMixin<UserI, string>;
  hasInvitees: BelongsToManyHasAssociationsMixin<UserI, string>;
  getInvitees: BelongsToManyGetAssociationsMixin<UserI>;
  setInvitees: BelongsToManySetAssociationsMixin<UserI, string>;
  addInvitee: BelongsToManyAddAssociationMixin<UserI, string>;
  addInvitees: BelongsToManyAddAssociationsMixin<UserI, string>;
  removeInvitee: BelongsToManyRemoveAssociationMixin<UserI, string>;
  removeInvitees: BelongsToManyRemoveAssociationsMixin<UserI, string>;
  createInvitee: BelongsToManyCreateAssociationMixin<UserI>;

};
// ============== end model: UserGroup ==============

// ============== start model: Organization ==============
export type OrganizationCreationAttributes = {
  name?: string;
  data?: any;
  testDataForDiff?: any;
  users?: UserCreationAttributes[];
  testAssociation?: ProjectCreationAttributes;
  ownedUser?: UserCreationAttributes[];
  projects?: ProjectCreationAttributes[];
  inviters?: UserCreationAttributes[];
  invitees?: UserCreationAttributes[];
  test_asc_id?: string;
};

export type OrganizationAttributes = {
  id: string;
  name?: string;
  data?: any;
  testDataForDiff?: any;
  users?: ExtendedModel<UserI>[];
  testAssociation?: ExtendedModel<ProjectI>;
  ownedUser?: ExtendedModel<UserI>[];
  projects?: ExtendedModel<ProjectI>[];
  inviters?: ExtendedModel<UserI>[];
  invitees?: ExtendedModel<UserI>[];
  test_asc_id?: string;
};

export type OrganizationI = OrganizationAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: users
  countUsers: BelongsToManyCountAssociationsMixin;
  hasUser: BelongsToManyHasAssociationMixin<UserI, string>;
  hasUsers: BelongsToManyHasAssociationsMixin<UserI, string>;
  getUsers: BelongsToManyGetAssociationsMixin<UserI>;
  setUsers: BelongsToManySetAssociationsMixin<UserI, string>;
  addUser: BelongsToManyAddAssociationMixin<UserI, string>;
  addUsers: BelongsToManyAddAssociationsMixin<UserI, string>;
  removeUser: BelongsToManyRemoveAssociationMixin<UserI, string>;
  removeUsers: BelongsToManyRemoveAssociationsMixin<UserI, string>;
  createUser: BelongsToManyCreateAssociationMixin<UserI>;


  // association: testAssociation
  getTestAssociation: BelongsToGetAssociationMixin<ProjectI>;
  setTestAssociation: BelongsToSetAssociationMixin<ProjectI, string>;
  createTestAssociation: BelongsToCreateAssociationMixin<ProjectI>;

  // association: ownedUser
  countOwnedUsers: HasManyCountAssociationsMixin;
  hasOwnedUser: HasManyHasAssociationMixin<UserI, string>;
  hasOwnedUsers: HasManyHasAssociationsMixin<UserI, string>;
  getOwnedUsers: HasManyGetAssociationsMixin<UserI>;
  setOwnedUsers: HasManySetAssociationsMixin<UserI, string>;
  addOwnedUser: HasManyAddAssociationMixin<UserI, string>;
  addOwnedUsers: HasManyAddAssociationsMixin<UserI, string>;
  removeOwnedUser: HasManyRemoveAssociationMixin<UserI, string>;
  removeOwnedUsers: HasManyRemoveAssociationsMixin<UserI, string>;
  createOwnedUser: HasManyCreateAssociationMixin<UserI>;

  // association: projects
  countProjects: HasManyCountAssociationsMixin;
  hasProject: HasManyHasAssociationMixin<ProjectI, string>;
  hasProjects: HasManyHasAssociationsMixin<ProjectI, string>;
  getProjects: HasManyGetAssociationsMixin<ProjectI>;
  setProjects: HasManySetAssociationsMixin<ProjectI, string>;
  addProject: HasManyAddAssociationMixin<ProjectI, string>;
  addProjects: HasManyAddAssociationsMixin<ProjectI, string>;
  removeProject: HasManyRemoveAssociationMixin<ProjectI, string>;
  removeProjects: HasManyRemoveAssociationsMixin<ProjectI, string>;
  createProject: HasManyCreateAssociationMixin<ProjectI>;

  // association: inviters
  countInviters: BelongsToManyCountAssociationsMixin;
  hasInviter: BelongsToManyHasAssociationMixin<UserI, string>;
  hasInviters: BelongsToManyHasAssociationsMixin<UserI, string>;
  getInviters: BelongsToManyGetAssociationsMixin<UserI>;
  setInviters: BelongsToManySetAssociationsMixin<UserI, string>;
  addInviter: BelongsToManyAddAssociationMixin<UserI, string>;
  addInviters: BelongsToManyAddAssociationsMixin<UserI, string>;
  removeInviter: BelongsToManyRemoveAssociationMixin<UserI, string>;
  removeInviters: BelongsToManyRemoveAssociationsMixin<UserI, string>;
  createInviter: BelongsToManyCreateAssociationMixin<UserI>;


  // association: invitees
  countInvitees: BelongsToManyCountAssociationsMixin;
  hasInvitee: BelongsToManyHasAssociationMixin<UserI, string>;
  hasInvitees: BelongsToManyHasAssociationsMixin<UserI, string>;
  getInvitees: BelongsToManyGetAssociationsMixin<UserI>;
  setInvitees: BelongsToManySetAssociationsMixin<UserI, string>;
  addInvitee: BelongsToManyAddAssociationMixin<UserI, string>;
  addInvitees: BelongsToManyAddAssociationsMixin<UserI, string>;
  removeInvitee: BelongsToManyRemoveAssociationMixin<UserI, string>;
  removeInvitees: BelongsToManyRemoveAssociationsMixin<UserI, string>;
  createInvitee: BelongsToManyCreateAssociationMixin<UserI>;

};
// ============== end model: Organization ==============

// ============== start model: Project ==============
export type ProjectCreationAttributes = {
  type?: string;
  name?: string;
  data?: any;
  users?: UserCreationAttributes[];
  organization?: OrganizationCreationAttributes;
  inviters?: UserCreationAttributes[];
  invitees?: UserCreationAttributes[];
  organization_id?: string;
};

export type ProjectAttributes = {
  id: string;
  type?: string;
  name?: string;
  data?: any;
  users?: ExtendedModel<UserI>[];
  organization?: ExtendedModel<OrganizationI>;
  inviters?: ExtendedModel<UserI>[];
  invitees?: ExtendedModel<UserI>[];
  organization_id?: string;
};

export type ProjectI = ProjectAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: users
  countUsers: BelongsToManyCountAssociationsMixin;
  hasUser: BelongsToManyHasAssociationMixin<UserI, string>;
  hasUsers: BelongsToManyHasAssociationsMixin<UserI, string>;
  getUsers: BelongsToManyGetAssociationsMixin<UserI>;
  setUsers: BelongsToManySetAssociationsMixin<UserI, string>;
  addUser: BelongsToManyAddAssociationMixin<UserI, string>;
  addUsers: BelongsToManyAddAssociationsMixin<UserI, string>;
  removeUser: BelongsToManyRemoveAssociationMixin<UserI, string>;
  removeUsers: BelongsToManyRemoveAssociationsMixin<UserI, string>;
  createUser: BelongsToManyCreateAssociationMixin<UserI>;


  // association: organization
  getOrganization: BelongsToGetAssociationMixin<OrganizationI>;
  setOrganization: BelongsToSetAssociationMixin<OrganizationI, string>;
  createOrganization: BelongsToCreateAssociationMixin<OrganizationI>;

  // association: inviters
  countInviters: BelongsToManyCountAssociationsMixin;
  hasInviter: BelongsToManyHasAssociationMixin<UserI, string>;
  hasInviters: BelongsToManyHasAssociationsMixin<UserI, string>;
  getInviters: BelongsToManyGetAssociationsMixin<UserI>;
  setInviters: BelongsToManySetAssociationsMixin<UserI, string>;
  addInviter: BelongsToManyAddAssociationMixin<UserI, string>;
  addInviters: BelongsToManyAddAssociationsMixin<UserI, string>;
  removeInviter: BelongsToManyRemoveAssociationMixin<UserI, string>;
  removeInviters: BelongsToManyRemoveAssociationsMixin<UserI, string>;
  createInviter: BelongsToManyCreateAssociationMixin<UserI>;


  // association: invitees
  countInvitees: BelongsToManyCountAssociationsMixin;
  hasInvitee: BelongsToManyHasAssociationMixin<UserI, string>;
  hasInvitees: BelongsToManyHasAssociationsMixin<UserI, string>;
  getInvitees: BelongsToManyGetAssociationsMixin<UserI>;
  setInvitees: BelongsToManySetAssociationsMixin<UserI, string>;
  addInvitee: BelongsToManyAddAssociationMixin<UserI, string>;
  addInvitees: BelongsToManyAddAssociationsMixin<UserI, string>;
  removeInvitee: BelongsToManyRemoveAssociationMixin<UserI, string>;
  removeInvitees: BelongsToManyRemoveAssociationsMixin<UserI, string>;
  createInvitee: BelongsToManyCreateAssociationMixin<UserI>;

};
// ============== end model: Project ==============

// ============== start model: Memo ==============
export type MemoCreationAttributes = {
  data?: any;
  users?: UserCreationAttributes[];
};

export type MemoAttributes = {
  id: string;
  data?: any;
  users?: ExtendedModel<UserI>[];
};

export type MemoI = MemoAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: users
  countUsers: BelongsToManyCountAssociationsMixin;
  hasUser: BelongsToManyHasAssociationMixin<UserI, string>;
  hasUsers: BelongsToManyHasAssociationsMixin<UserI, string>;
  getUsers: BelongsToManyGetAssociationsMixin<UserI>;
  setUsers: BelongsToManySetAssociationsMixin<UserI, string>;
  addUser: BelongsToManyAddAssociationMixin<UserI, string>;
  addUsers: BelongsToManyAddAssociationsMixin<UserI, string>;
  removeUser: BelongsToManyRemoveAssociationMixin<UserI, string>;
  removeUsers: BelongsToManyRemoveAssociationsMixin<UserI, string>;
  createUser: BelongsToManyCreateAssociationMixin<UserI>;

};
// ============== end model: Memo ==============

// ============== start model: ContactUsMessage ==============
export type ContactUsMessageCreationAttributes = {
  message?: string;
  data?: any;
  author?: UserCreationAttributes;
  assignee?: UserCreationAttributes;
  state?: string;
  author_id?: string;
  assignee_id?: string;
};

export type ContactUsMessageAttributes = {
  id: string;
  message?: string;
  data?: any;
  author?: ExtendedModel<UserI>;
  assignee?: ExtendedModel<UserI>;
  state?: string;
  author_id?: string;
  assignee_id?: string;
};

export type ContactUsMessageI = ContactUsMessageAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: author
  getAuthor: BelongsToGetAssociationMixin<UserI>;
  setAuthor: BelongsToSetAssociationMixin<UserI, string>;
  createAuthor: BelongsToCreateAssociationMixin<UserI>;

  // association: assignee
  getAssignee: BelongsToGetAssociationMixin<UserI>;
  setAssignee: BelongsToSetAssociationMixin<UserI, string>;
  createAssignee: BelongsToCreateAssociationMixin<UserI>;
};
// ============== end model: ContactUsMessage ==============

// ============== start model: ProductCategory ==============
export type ProductCategoryCreationAttributes = {
  name?: string;
  priority?: number;
  active?: boolean;
  data?: any;
  groups?: ProductGroupCreationAttributes[];
};

export type ProductCategoryAttributes = {
  id: string;
  name?: string;
  priority?: number;
  active?: boolean;
  data?: any;
  groups?: ExtendedModel<ProductGroupI>[];
};

export type ProductCategoryI = ProductCategoryAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: groups
  countGroups: HasManyCountAssociationsMixin;
  hasGroup: HasManyHasAssociationMixin<ProductGroupI, string>;
  hasGroups: HasManyHasAssociationsMixin<ProductGroupI, string>;
  getGroups: HasManyGetAssociationsMixin<ProductGroupI>;
  setGroups: HasManySetAssociationsMixin<ProductGroupI, string>;
  addGroup: HasManyAddAssociationMixin<ProductGroupI, string>;
  addGroups: HasManyAddAssociationsMixin<ProductGroupI, string>;
  removeGroup: HasManyRemoveAssociationMixin<ProductGroupI, string>;
  removeGroups: HasManyRemoveAssociationsMixin<ProductGroupI, string>;
  createGroup: HasManyCreateAssociationMixin<ProductGroupI>;
};
// ============== end model: ProductCategory ==============

// ============== start model: Product ==============
export type ProductCreationAttributes = {
  customId?: string;
  color?: string;
  colorName?: string;
  size?: string;
  thumbnail?: any;
  pictures?: any;
  name?: string;
  price?: number;
  weight?: number;
  description?: string;
  data?: any;
  ordering?: number;
  instock?: number;
  group?: ProductGroupCreationAttributes;
  orders?: OrderCreationAttributes[];
  group_id?: string;
};

export type ProductAttributes = {
  id: string;
  customId?: string;
  color?: string;
  colorName?: string;
  size?: string;
  thumbnail?: any;
  pictures?: any;
  name?: string;
  price?: number;
  weight?: number;
  description?: string;
  data?: any;
  ordering?: number;
  instock?: number;
  group?: ExtendedModel<ProductGroupI>;
  orders?: ExtendedModel<OrderI>[];
  group_id?: string;
};

export type ProductI = ProductAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: group
  getGroup: BelongsToGetAssociationMixin<ProductGroupI>;
  setGroup: BelongsToSetAssociationMixin<ProductGroupI, string>;
  createGroup: BelongsToCreateAssociationMixin<ProductGroupI>;

  // association: orders
  countOrders: BelongsToManyCountAssociationsMixin;
  hasOrder: BelongsToManyHasAssociationMixin<OrderI, string>;
  hasOrders: BelongsToManyHasAssociationsMixin<OrderI, string>;
  getOrders: BelongsToManyGetAssociationsMixin<OrderI>;
  setOrders: BelongsToManySetAssociationsMixin<OrderI, string>;
  addOrder: BelongsToManyAddAssociationMixin<OrderI, string>;
  addOrders: BelongsToManyAddAssociationsMixin<OrderI, string>;
  removeOrder: BelongsToManyRemoveAssociationMixin<OrderI, string>;
  removeOrders: BelongsToManyRemoveAssociationsMixin<OrderI, string>;
  createOrder: BelongsToManyCreateAssociationMixin<OrderI>;

};
// ============== end model: Product ==============

// ============== start model: ProductGroup ==============
export type ProductGroupCreationAttributes = {
  customId?: string;
  thumbnail?: any;
  pictures?: any;
  name?: string;
  price?: number;
  weight?: number;
  description?: string;
  data?: any;
  materials?: string;
  products?: ProductCreationAttributes[];
  category?: ProductCategoryCreationAttributes;
  campaigns?: CampaignCreationAttributes[];
  category_id?: string;
};

export type ProductGroupAttributes = {
  id: string;
  customId?: string;
  thumbnail?: any;
  pictures?: any;
  name?: string;
  price?: number;
  weight?: number;
  description?: string;
  data?: any;
  materials?: string;
  products?: ExtendedModel<ProductI>[];
  category?: ExtendedModel<ProductCategoryI>;
  campaigns?: ExtendedModel<CampaignI>[];
  category_id?: string;
};

export type ProductGroupI = ProductGroupAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: products
  countProducts: HasManyCountAssociationsMixin;
  hasProduct: HasManyHasAssociationMixin<ProductI, string>;
  hasProducts: HasManyHasAssociationsMixin<ProductI, string>;
  getProducts: HasManyGetAssociationsMixin<ProductI>;
  setProducts: HasManySetAssociationsMixin<ProductI, string>;
  addProduct: HasManyAddAssociationMixin<ProductI, string>;
  addProducts: HasManyAddAssociationsMixin<ProductI, string>;
  removeProduct: HasManyRemoveAssociationMixin<ProductI, string>;
  removeProducts: HasManyRemoveAssociationsMixin<ProductI, string>;
  createProduct: HasManyCreateAssociationMixin<ProductI>;

  // association: category
  getCategory: BelongsToGetAssociationMixin<ProductCategoryI>;
  setCategory: BelongsToSetAssociationMixin<ProductCategoryI, string>;
  createCategory: BelongsToCreateAssociationMixin<ProductCategoryI>;

  // association: campaigns
  countCampaigns: BelongsToManyCountAssociationsMixin;
  hasCampaign: BelongsToManyHasAssociationMixin<CampaignI, string>;
  hasCampaigns: BelongsToManyHasAssociationsMixin<CampaignI, string>;
  getCampaigns: BelongsToManyGetAssociationsMixin<CampaignI>;
  setCampaigns: BelongsToManySetAssociationsMixin<CampaignI, string>;
  addCampaign: BelongsToManyAddAssociationMixin<CampaignI, string>;
  addCampaigns: BelongsToManyAddAssociationsMixin<CampaignI, string>;
  removeCampaign: BelongsToManyRemoveAssociationMixin<CampaignI, string>;
  removeCampaigns: BelongsToManyRemoveAssociationsMixin<CampaignI, string>;
  createCampaign: BelongsToManyCreateAssociationMixin<CampaignI>;

};
// ============== end model: ProductGroup ==============

// ============== start model: Campaign ==============
export type CampaignCreationAttributes = {
  name?: string;
  type?: string;
  durationType?: string;
  start?: Date;
  end?: Date;
  state?: string;
  data?: any;
  productGroups?: ProductGroupCreationAttributes[];
};

export type CampaignAttributes = {
  id: string;
  name?: string;
  type?: string;
  durationType?: string;
  start?: Date;
  end?: Date;
  state?: string;
  data?: any;
  productGroups?: ExtendedModel<ProductGroupI>[];
};

export type CampaignI = CampaignAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: productGroups
  countProductGroups: BelongsToManyCountAssociationsMixin;
  hasProductGroup: BelongsToManyHasAssociationMixin<ProductGroupI, string>;
  hasProductGroups: BelongsToManyHasAssociationsMixin<ProductGroupI, string>;
  getProductGroups: BelongsToManyGetAssociationsMixin<ProductGroupI>;
  setProductGroups: BelongsToManySetAssociationsMixin<ProductGroupI, string>;
  addProductGroup: BelongsToManyAddAssociationMixin<ProductGroupI, string>;
  addProductGroups: BelongsToManyAddAssociationsMixin<ProductGroupI, string>;
  removeProductGroup: BelongsToManyRemoveAssociationMixin<ProductGroupI, string>;
  removeProductGroups: BelongsToManyRemoveAssociationsMixin<ProductGroupI, string>;
  createProductGroup: BelongsToManyCreateAssociationMixin<ProductGroupI>;

};
// ============== end model: Campaign ==============

// ============== start model: OrdererInfo ==============
export type OrdererInfoCreationAttributes = {
  name?: string;
  mobile?: string;
  phone1?: string;
  phone2?: string;
  zipcode?: string;
  address?: string;
  area?: string;
  email1?: string;
  email2?: string;
  user?: UserCreationAttributes;
  asDefaultTo?: UserCreationAttributes;
  user_id?: string;
  as_default_to?: string;
};

export type OrdererInfoAttributes = {
  id: string;
  name?: string;
  mobile?: string;
  phone1?: string;
  phone2?: string;
  zipcode?: string;
  address?: string;
  area?: string;
  email1?: string;
  email2?: string;
  user?: ExtendedModel<UserI>;
  asDefaultTo?: ExtendedModel<UserI>;
  user_id?: string;
  as_default_to?: string;
};

export type OrdererInfoI = OrdererInfoAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: user
  getUser: BelongsToGetAssociationMixin<UserI>;
  setUser: BelongsToSetAssociationMixin<UserI, string>;
  createUser: BelongsToCreateAssociationMixin<UserI>;

  // association: asDefaultTo
  getAsDefaultTo: BelongsToGetAssociationMixin<UserI>;
  setAsDefaultTo: BelongsToSetAssociationMixin<UserI, string>;
  createAsDefaultTo: BelongsToCreateAssociationMixin<UserI>;
};
// ============== end model: OrdererInfo ==============

// ============== start model: RecipientInfo ==============
export type RecipientInfoCreationAttributes = {
  name?: string;
  mobile?: string;
  phone1?: string;
  phone2?: string;
  zipcode?: string;
  address?: string;
  area?: string;
  email1?: string;
  email2?: string;
  user?: UserCreationAttributes;
  asDefaultTo?: UserCreationAttributes;
  user_id?: string;
  as_default_to?: string;
};

export type RecipientInfoAttributes = {
  id: string;
  name?: string;
  mobile?: string;
  phone1?: string;
  phone2?: string;
  zipcode?: string;
  address?: string;
  area?: string;
  email1?: string;
  email2?: string;
  user?: ExtendedModel<UserI>;
  asDefaultTo?: ExtendedModel<UserI>;
  user_id?: string;
  as_default_to?: string;
};

export type RecipientInfoI = RecipientInfoAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: user
  getUser: BelongsToGetAssociationMixin<UserI>;
  setUser: BelongsToSetAssociationMixin<UserI, string>;
  createUser: BelongsToCreateAssociationMixin<UserI>;

  // association: asDefaultTo
  getAsDefaultTo: BelongsToGetAssociationMixin<UserI>;
  setAsDefaultTo: BelongsToSetAssociationMixin<UserI, string>;
  createAsDefaultTo: BelongsToCreateAssociationMixin<UserI>;
};
// ============== end model: RecipientInfo ==============

// ============== start model: Order ==============
export type OrderCreationAttributes = {
  memo?: string;
  shipmentId?: string;
  orderer?: any;
  recipient?: any;
  data?: any;
  user?: UserCreationAttributes;
  products?: ProductCreationAttributes[];
  user_id?: string;
};

export type OrderAttributes = {
  id: string;
  memo?: string;
  shipmentId?: string;
  orderer?: any;
  recipient?: any;
  data?: any;
  user?: ExtendedModel<UserI>;
  products?: ExtendedModel<ProductI>[];
  user_id?: string;
};

export type OrderI = OrderAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: user
  getUser: BelongsToGetAssociationMixin<UserI>;
  setUser: BelongsToSetAssociationMixin<UserI, string>;
  createUser: BelongsToCreateAssociationMixin<UserI>;

  // association: products
  countProducts: BelongsToManyCountAssociationsMixin;
  hasProduct: BelongsToManyHasAssociationMixin<ProductI, string>;
  hasProducts: BelongsToManyHasAssociationsMixin<ProductI, string>;
  getProducts: BelongsToManyGetAssociationsMixin<ProductI>;
  setProducts: BelongsToManySetAssociationsMixin<ProductI, string>;
  addProduct: BelongsToManyAddAssociationMixin<ProductI, string>;
  addProducts: BelongsToManyAddAssociationsMixin<ProductI, string>;
  removeProduct: BelongsToManyRemoveAssociationMixin<ProductI, string>;
  removeProducts: BelongsToManyRemoveAssociationsMixin<ProductI, string>;
  createProduct: BelongsToManyCreateAssociationMixin<ProductI>;

};
// ============== end model: Order ==============

// ============== start model: SubscriptionOrder ==============
export type SubscriptionOrderCreationAttributes = {
  memo?: string;
  shipmentId?: string;
  orderer?: any;
  recipient?: any;
  data?: any;
  user?: UserCreationAttributes;
  user_id?: string;
};

export type SubscriptionOrderAttributes = {
  id: string;
  memo?: string;
  shipmentId?: string;
  orderer?: any;
  recipient?: any;
  data?: any;
  user?: ExtendedModel<UserI>;
  user_id?: string;
};

export type SubscriptionOrderI = SubscriptionOrderAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: user
  getUser: BelongsToGetAssociationMixin<UserI>;
  setUser: BelongsToSetAssociationMixin<UserI, string>;
  createUser: BelongsToCreateAssociationMixin<UserI>;
};
// ============== end model: SubscriptionOrder ==============

// ============== start model: UserUserGroup ==============
export type UserUserGroupCreationAttributes = {
  role?: string;
  user?: UserCreationAttributes;
  group?: UserGroupCreationAttributes;
  user_id?: string;
  group_id?: string;
};

export type UserUserGroupAttributes = {
  id: string;
  role?: string;
  user?: ExtendedModel<UserI>;
  group?: ExtendedModel<UserGroupI>;
  user_id?: string;
  group_id?: string;
};

export type UserUserGroupI = UserUserGroupAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: user
  getUser: BelongsToGetAssociationMixin<UserI>;
  setUser: BelongsToSetAssociationMixin<UserI, string>;
  createUser: BelongsToCreateAssociationMixin<UserI>;

  // association: group
  getGroup: BelongsToGetAssociationMixin<UserGroupI>;
  setGroup: BelongsToSetAssociationMixin<UserGroupI, string>;
  createGroup: BelongsToCreateAssociationMixin<UserGroupI>;
};
// ============== end model: UserUserGroup ==============

// ============== start model: GroupInvitation ==============
export type GroupInvitationCreationAttributes = {
  state?: number;
  invitee?: UserCreationAttributes;
  inviter?: UserCreationAttributes;
  group?: UserGroupCreationAttributes;
  invitee_id?: string;
  inviter_id?: string;
  group_id?: string;
};

export type GroupInvitationAttributes = {
  id: string;
  state?: number;
  invitee?: ExtendedModel<UserI>;
  inviter?: ExtendedModel<UserI>;
  group?: ExtendedModel<UserGroupI>;
  invitee_id?: string;
  inviter_id?: string;
  group_id?: string;
};

export type GroupInvitationI = GroupInvitationAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: invitee
  getInvitee: BelongsToGetAssociationMixin<UserI>;
  setInvitee: BelongsToSetAssociationMixin<UserI, string>;
  createInvitee: BelongsToCreateAssociationMixin<UserI>;

  // association: inviter
  getInviter: BelongsToGetAssociationMixin<UserI>;
  setInviter: BelongsToSetAssociationMixin<UserI, string>;
  createInviter: BelongsToCreateAssociationMixin<UserI>;

  // association: group
  getGroup: BelongsToGetAssociationMixin<UserGroupI>;
  setGroup: BelongsToSetAssociationMixin<UserGroupI, string>;
  createGroup: BelongsToCreateAssociationMixin<UserGroupI>;
};
// ============== end model: GroupInvitation ==============

// ============== start model: UserOrganization ==============
export type UserOrganizationCreationAttributes = {
  labels?: any;
  data?: any;
  role?: string;
  user?: UserCreationAttributes;
  organization?: OrganizationCreationAttributes;
  user_id?: string;
  organization_id?: string;
};

export type UserOrganizationAttributes = {
  id: string;
  labels?: any;
  data?: any;
  role?: string;
  user?: ExtendedModel<UserI>;
  organization?: ExtendedModel<OrganizationI>;
  user_id?: string;
  organization_id?: string;
};

export type UserOrganizationI = UserOrganizationAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: user
  getUser: BelongsToGetAssociationMixin<UserI>;
  setUser: BelongsToSetAssociationMixin<UserI, string>;
  createUser: BelongsToCreateAssociationMixin<UserI>;

  // association: organization
  getOrganization: BelongsToGetAssociationMixin<OrganizationI>;
  setOrganization: BelongsToSetAssociationMixin<OrganizationI, string>;
  createOrganization: BelongsToCreateAssociationMixin<OrganizationI>;
};
// ============== end model: UserOrganization ==============

// ============== start model: OrganizationInvitation ==============
export type OrganizationInvitationCreationAttributes = {
  state?: number;
  invitee?: UserCreationAttributes;
  inviter?: UserCreationAttributes;
  organization?: OrganizationCreationAttributes;
  invitee_id?: string;
  inviter_id?: string;
  organization_id?: string;
};

export type OrganizationInvitationAttributes = {
  id: string;
  state?: number;
  invitee?: ExtendedModel<UserI>;
  inviter?: ExtendedModel<UserI>;
  organization?: ExtendedModel<OrganizationI>;
  invitee_id?: string;
  inviter_id?: string;
  organization_id?: string;
};

export type OrganizationInvitationI = OrganizationInvitationAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: invitee
  getInvitee: BelongsToGetAssociationMixin<UserI>;
  setInvitee: BelongsToSetAssociationMixin<UserI, string>;
  createInvitee: BelongsToCreateAssociationMixin<UserI>;

  // association: inviter
  getInviter: BelongsToGetAssociationMixin<UserI>;
  setInviter: BelongsToSetAssociationMixin<UserI, string>;
  createInviter: BelongsToCreateAssociationMixin<UserI>;

  // association: organization
  getOrganization: BelongsToGetAssociationMixin<OrganizationI>;
  setOrganization: BelongsToSetAssociationMixin<OrganizationI, string>;
  createOrganization: BelongsToCreateAssociationMixin<OrganizationI>;
};
// ============== end model: OrganizationInvitation ==============

// ============== start model: UserProject ==============
export type UserProjectCreationAttributes = {
  labels?: any;
  data?: any;
  role?: string;
  user?: UserCreationAttributes;
  project?: ProjectCreationAttributes;
  user_id?: string;
  project_id?: string;
};

export type UserProjectAttributes = {
  id: string;
  labels?: any;
  data?: any;
  role?: string;
  user?: ExtendedModel<UserI>;
  project?: ExtendedModel<ProjectI>;
  user_id?: string;
  project_id?: string;
};

export type UserProjectI = UserProjectAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: user
  getUser: BelongsToGetAssociationMixin<UserI>;
  setUser: BelongsToSetAssociationMixin<UserI, string>;
  createUser: BelongsToCreateAssociationMixin<UserI>;

  // association: project
  getProject: BelongsToGetAssociationMixin<ProjectI>;
  setProject: BelongsToSetAssociationMixin<ProjectI, string>;
  createProject: BelongsToCreateAssociationMixin<ProjectI>;
};
// ============== end model: UserProject ==============

// ============== start model: ProjectInvitation ==============
export type ProjectInvitationCreationAttributes = {
  state?: number;
  invitee?: UserCreationAttributes;
  inviter?: UserCreationAttributes;
  project?: ProjectCreationAttributes;
  invitee_id?: string;
  inviter_id?: string;
  project_id?: string;
};

export type ProjectInvitationAttributes = {
  id: string;
  state?: number;
  invitee?: ExtendedModel<UserI>;
  inviter?: ExtendedModel<UserI>;
  project?: ExtendedModel<ProjectI>;
  invitee_id?: string;
  inviter_id?: string;
  project_id?: string;
};

export type ProjectInvitationI = ProjectInvitationAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: invitee
  getInvitee: BelongsToGetAssociationMixin<UserI>;
  setInvitee: BelongsToSetAssociationMixin<UserI, string>;
  createInvitee: BelongsToCreateAssociationMixin<UserI>;

  // association: inviter
  getInviter: BelongsToGetAssociationMixin<UserI>;
  setInviter: BelongsToSetAssociationMixin<UserI, string>;
  createInviter: BelongsToCreateAssociationMixin<UserI>;

  // association: project
  getProject: BelongsToGetAssociationMixin<ProjectI>;
  setProject: BelongsToSetAssociationMixin<ProjectI, string>;
  createProject: BelongsToCreateAssociationMixin<ProjectI>;
};
// ============== end model: ProjectInvitation ==============

// ============== start model: UserMemo ==============
export type UserMemoCreationAttributes = {
  role?: string;
  userSetting?: UserSettingCreationAttributes;
  user?: UserCreationAttributes;
  memo?: MemoCreationAttributes;
  user_id?: string;
  memo_id?: string;
  exData?: UserMemoExCreationAttributes;
};

export type UserMemoAttributes = {
  id: string;
  role?: string;
  userSetting?: ExtendedModel<UserSettingI>;
  user?: ExtendedModel<UserI>;
  memo?: ExtendedModel<MemoI>;
  user_id?: string;
  memo_id?: string;
  exData?: ExtendedModel<UserMemoExI>;
};

export type UserMemoI = UserMemoAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: userSetting
  getUserSetting: HasOneGetAssociationMixin<UserSettingI>;
  setUserSetting: HasOneSetAssociationMixin<UserSettingI, string>;
  createUserSetting: HasOneCreateAssociationMixin<UserSettingI>;

  // association: user
  getUser: BelongsToGetAssociationMixin<UserI>;
  setUser: BelongsToSetAssociationMixin<UserI, string>;
  createUser: BelongsToCreateAssociationMixin<UserI>;

  // association: memo
  getMemo: BelongsToGetAssociationMixin<MemoI>;
  setMemo: BelongsToSetAssociationMixin<MemoI, string>;
  createMemo: BelongsToCreateAssociationMixin<MemoI>;

  // association: exData
  getExData: HasOneGetAssociationMixin<UserMemoExI>;
  setExData: HasOneSetAssociationMixin<UserMemoExI, string>;
  createExData: HasOneCreateAssociationMixin<UserMemoExI>;
};
// ============== end model: UserMemo ==============

// ============== start model: UserMemoEx ==============
export type UserMemoExCreationAttributes = {
  data?: any;
  userSetting?: UserSettingCreationAttributes;
  userMemo?: UserMemoCreationAttributes;
  user_setting_id?: string;
  user_memo_id?: string;
};

export type UserMemoExAttributes = {
  id: string;
  data?: any;
  userSetting?: ExtendedModel<UserSettingI>;
  userMemo?: ExtendedModel<UserMemoI>;
  user_setting_id?: string;
  user_memo_id?: string;
};

export type UserMemoExI = UserMemoExAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: userSetting
  getUserSetting: BelongsToGetAssociationMixin<UserSettingI>;
  setUserSetting: BelongsToSetAssociationMixin<UserSettingI, string>;
  createUserSetting: BelongsToCreateAssociationMixin<UserSettingI>;

  // association: userMemo
  getUserMemo: BelongsToGetAssociationMixin<UserMemoI>;
  setUserMemo: BelongsToSetAssociationMixin<UserMemoI, string>;
  createUserMemo: BelongsToCreateAssociationMixin<UserMemoI>;
};
// ============== end model: UserMemoEx ==============

// ============== start model: OrderProduct ==============
export type OrderProductCreationAttributes = {
  quantity?: number;
  price?: number;
  totalPrice?: number;
  data?: any;
  product?: ProductCreationAttributes;
  order?: OrderCreationAttributes;
  product_id?: string;
  order_id?: string;
};

export type OrderProductAttributes = {
  id: string;
  quantity?: number;
  price?: number;
  totalPrice?: number;
  data?: any;
  product?: ExtendedModel<ProductI>;
  order?: ExtendedModel<OrderI>;
  product_id?: string;
  order_id?: string;
};

export type OrderProductI = OrderProductAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: product
  getProduct: BelongsToGetAssociationMixin<ProductI>;
  setProduct: BelongsToSetAssociationMixin<ProductI, string>;
  createProduct: BelongsToCreateAssociationMixin<ProductI>;

  // association: order
  getOrder: BelongsToGetAssociationMixin<OrderI>;
  setOrder: BelongsToSetAssociationMixin<OrderI, string>;
  createOrder: BelongsToCreateAssociationMixin<OrderI>;
};
// ============== end model: OrderProduct ==============

// ============== start model: ProductGroupCampaign ==============
export type ProductGroupCampaignCreationAttributes = {
  data?: any;
  productGroup?: ProductGroupCreationAttributes;
  campaign?: CampaignCreationAttributes;
  product_group_id?: string;
  campaign_id?: string;
};

export type ProductGroupCampaignAttributes = {
  id: string;
  data?: any;
  productGroup?: ExtendedModel<ProductGroupI>;
  campaign?: ExtendedModel<CampaignI>;
  product_group_id?: string;
  campaign_id?: string;
};

export type ProductGroupCampaignI = ProductGroupCampaignAttributes & {

  // timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at: Date;

  // association: productGroup
  getProductGroup: BelongsToGetAssociationMixin<ProductGroupI>;
  setProductGroup: BelongsToSetAssociationMixin<ProductGroupI, string>;
  createProductGroup: BelongsToCreateAssociationMixin<ProductGroupI>;

  // association: campaign
  getCampaign: BelongsToGetAssociationMixin<CampaignI>;
  setCampaign: BelongsToSetAssociationMixin<CampaignI, string>;
  createCampaign: BelongsToCreateAssociationMixin<CampaignI>;
};
// ============== end model: ProductGroupCampaign ==============

