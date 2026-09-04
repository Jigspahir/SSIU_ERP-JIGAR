import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AuditLog_Key {
  id: UUIDString;
  __typename?: 'AuditLog_Key';
}

export interface BulkOperation_Key {
  id: UUIDString;
  __typename?: 'BulkOperation_Key';
}

export interface CreateAuditLogData {
  auditLog_insert: AuditLog_Key;
}

export interface CreateAuditLogVariables {
  action: string;
  performedById: UUIDString;
  timestamp: TimestampString;
  entityAffected?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
}

export interface CreateBulkOperationData {
  bulkOperation_insert: BulkOperation_Key;
}

export interface CreateBulkOperationVariables {
  operationName: string;
  status: string;
  uploadedAt: TimestampString;
  totalRecords?: number | null;
  successCount?: number | null;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  createdAt: TimestampString;
  updatedAt: TimestampString;
}

export interface GetUserByEmailData {
  users: ({
    id: UUIDString;
    email: string;
    passwordHash?: string | null;
    role: string;
    isActive: boolean;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & User_Key)[];
}

export interface GetUserByEmailVariables {
  email: string;
}

export interface GetUserByIdData {
  user?: {
    id: UUIDString;
    email: string;
    role: string;
    isActive: boolean;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & User_Key;
}

export interface GetUserByIdVariables {
  id: UUIDString;
}

export interface ListBulkOperationsData {
  bulkOperations: ({
    id: UUIDString;
    operationName: string;
    status: string;
    uploadedAt: TimestampString;
    totalRecords?: number | null;
    successCount?: number | null;
  } & BulkOperation_Key)[];
}

export interface ListUsersByRoleData {
  users: ({
    id: UUIDString;
    email: string;
    role: string;
    isActive: boolean;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & User_Key)[];
}

export interface ListUsersByRoleVariables {
  role: string;
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    email: string;
    role: string;
    isActive: boolean;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & User_Key)[];
}

export interface Role_Key {
  id: UUIDString;
  __typename?: 'Role_Key';
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface UpdateUserVariables {
  id: UUIDString;
  isActive?: boolean | null;
  role?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  updatedAt: TimestampString;
}

export interface UserBulkRecord_Key {
  id: UUIDString;
  __typename?: 'UserBulkRecord_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;
export function updateUser(dc: DataConnect, vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface CreateAuditLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuditLogVariables): MutationRef<CreateAuditLogData, CreateAuditLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAuditLogVariables): MutationRef<CreateAuditLogData, CreateAuditLogVariables>;
  operationName: string;
}
export const createAuditLogRef: CreateAuditLogRef;

export function createAuditLog(vars: CreateAuditLogVariables): MutationPromise<CreateAuditLogData, CreateAuditLogVariables>;
export function createAuditLog(dc: DataConnect, vars: CreateAuditLogVariables): MutationPromise<CreateAuditLogData, CreateAuditLogVariables>;

interface CreateBulkOperationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBulkOperationVariables): MutationRef<CreateBulkOperationData, CreateBulkOperationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBulkOperationVariables): MutationRef<CreateBulkOperationData, CreateBulkOperationVariables>;
  operationName: string;
}
export const createBulkOperationRef: CreateBulkOperationRef;

export function createBulkOperation(vars: CreateBulkOperationVariables): MutationPromise<CreateBulkOperationData, CreateBulkOperationVariables>;
export function createBulkOperation(dc: DataConnect, vars: CreateBulkOperationVariables): MutationPromise<CreateBulkOperationData, CreateBulkOperationVariables>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface GetUserByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
  operationName: string;
}
export const getUserByIdRef: GetUserByIdRef;

export function getUserById(vars: GetUserByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByIdData, GetUserByIdVariables>;
export function getUserById(dc: DataConnect, vars: GetUserByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByIdData, GetUserByIdVariables>;

interface GetUserByEmailRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  operationName: string;
}
export const getUserByEmailRef: GetUserByEmailRef;

export function getUserByEmail(vars: GetUserByEmailVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;
export function getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface ListUsersByRoleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListUsersByRoleVariables): QueryRef<ListUsersByRoleData, ListUsersByRoleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListUsersByRoleVariables): QueryRef<ListUsersByRoleData, ListUsersByRoleVariables>;
  operationName: string;
}
export const listUsersByRoleRef: ListUsersByRoleRef;

export function listUsersByRole(vars: ListUsersByRoleVariables, options?: ExecuteQueryOptions): QueryPromise<ListUsersByRoleData, ListUsersByRoleVariables>;
export function listUsersByRole(dc: DataConnect, vars: ListUsersByRoleVariables, options?: ExecuteQueryOptions): QueryPromise<ListUsersByRoleData, ListUsersByRoleVariables>;

interface ListBulkOperationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBulkOperationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListBulkOperationsData, undefined>;
  operationName: string;
}
export const listBulkOperationsRef: ListBulkOperationsRef;

export function listBulkOperations(options?: ExecuteQueryOptions): QueryPromise<ListBulkOperationsData, undefined>;
export function listBulkOperations(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBulkOperationsData, undefined>;

