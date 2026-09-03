import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

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

/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createUser(dc: DataConnect, vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createUser(vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function updateUser(dc: DataConnect, vars: UpdateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateUser(vars: UpdateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserData>>;

/** Generated Node Admin SDK operation action function for the 'CreateAuditLog' Mutation. Allow users to execute without passing in DataConnect. */
export function createAuditLog(dc: DataConnect, vars: CreateAuditLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateAuditLogData>>;
/** Generated Node Admin SDK operation action function for the 'CreateAuditLog' Mutation. Allow users to pass in custom DataConnect instances. */
export function createAuditLog(vars: CreateAuditLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateAuditLogData>>;

/** Generated Node Admin SDK operation action function for the 'CreateBulkOperation' Mutation. Allow users to execute without passing in DataConnect. */
export function createBulkOperation(dc: DataConnect, vars: CreateBulkOperationVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateBulkOperationData>>;
/** Generated Node Admin SDK operation action function for the 'CreateBulkOperation' Mutation. Allow users to pass in custom DataConnect instances. */
export function createBulkOperation(vars: CreateBulkOperationVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateBulkOperationData>>;

/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to execute without passing in DataConnect. */
export function listUsers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;
/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to pass in custom DataConnect instances. */
export function listUsers(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;

/** Generated Node Admin SDK operation action function for the 'GetUserById' Query. Allow users to execute without passing in DataConnect. */
export function getUserById(dc: DataConnect, vars: GetUserByIdVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserByIdData>>;
/** Generated Node Admin SDK operation action function for the 'GetUserById' Query. Allow users to pass in custom DataConnect instances. */
export function getUserById(vars: GetUserByIdVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserByIdData>>;

/** Generated Node Admin SDK operation action function for the 'GetUserByEmail' Query. Allow users to execute without passing in DataConnect. */
export function getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserByEmailData>>;
/** Generated Node Admin SDK operation action function for the 'GetUserByEmail' Query. Allow users to pass in custom DataConnect instances. */
export function getUserByEmail(vars: GetUserByEmailVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserByEmailData>>;

/** Generated Node Admin SDK operation action function for the 'ListUsersByRole' Query. Allow users to execute without passing in DataConnect. */
export function listUsersByRole(dc: DataConnect, vars: ListUsersByRoleVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersByRoleData>>;
/** Generated Node Admin SDK operation action function for the 'ListUsersByRole' Query. Allow users to pass in custom DataConnect instances. */
export function listUsersByRole(vars: ListUsersByRoleVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersByRoleData>>;

/** Generated Node Admin SDK operation action function for the 'ListBulkOperations' Query. Allow users to execute without passing in DataConnect. */
export function listBulkOperations(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListBulkOperationsData>>;
/** Generated Node Admin SDK operation action function for the 'ListBulkOperations' Query. Allow users to pass in custom DataConnect instances. */
export function listBulkOperations(options?: OperationOptions): Promise<ExecuteOperationResponse<ListBulkOperationsData>>;

