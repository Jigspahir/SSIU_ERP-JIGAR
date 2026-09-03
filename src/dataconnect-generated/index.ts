import {
  mutationRef,
  executeMutation,
  queryRef,
  executeQuery,
  getDataConnect,
  makeMemoryCacheProvider,
  ConnectorConfig,
  DataConnectSettings,
  MutationRef,
  MutationPromise,
  QueryRef,
  QueryPromise,
  DataConnect
} from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig = {
  connector: 'example',
  service: 'swarrnim-erp-prod-service',
  location: 'europe-west2'
};

export const dataConnectSettings: DataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
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

function resolveDc(dcOrVars: any, vars?: any): { dc: DataConnect; vars: any } {
  if (vars === undefined) {
    return { dc: getDataConnect(connectorConfig, dataConnectSettings), vars: dcOrVars };
  }
  return { dc: dcOrVars, vars };
}

export const createUserRef = (dcOrVars: any, vars?: any): MutationRef<CreateUserData, CreateUserVariables> => {
  const { dc, vars: inputVars } = resolveDc(dcOrVars, vars);
  if ((dc as any)._useGeneratedSdk) {
    (dc as any)._useGeneratedSdk();
  }
  return mutationRef(dc, 'CreateUser', inputVars);
};
createUserRef.operationName = 'CreateUser';

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dcOrVars: any, vars?: any): MutationPromise<CreateUserData, CreateUserVariables> {
  const { dc, vars: inputVars } = resolveDc(dcOrVars, vars);
  return executeMutation(createUserRef(dc, inputVars));
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

export const updateUserRef = (dcOrVars: any, vars?: any): MutationRef<UpdateUserData, UpdateUserVariables> => {
  const { dc, vars: inputVars } = resolveDc(dcOrVars, vars);
  if ((dc as any)._useGeneratedSdk) {
    (dc as any)._useGeneratedSdk();
  }
  return mutationRef(dc, 'UpdateUser', inputVars);
};
updateUserRef.operationName = 'UpdateUser';

export function updateUser(vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;
export function updateUser(dc: DataConnect, vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;
export function updateUser(dcOrVars: any, vars?: any): MutationPromise<UpdateUserData, UpdateUserVariables> {
  const { dc, vars: inputVars } = resolveDc(dcOrVars, vars);
  return executeMutation(updateUserRef(dc, inputVars));
}

export interface PostgreSQLUserRecord {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetUserByEmailData {
  users: PostgreSQLUserRecord[];
}

export interface GetUserByEmailVariables {
  email: string;
}

export const getUserByEmailRef = (dcOrVars: any, vars?: any): QueryRef<GetUserByEmailData, GetUserByEmailVariables> => {
  const { dc, vars: inputVars } = resolveDc(dcOrVars, vars);
  if ((dc as any)._useGeneratedSdk) {
    (dc as any)._useGeneratedSdk();
  }
  return queryRef(dc, 'GetUserByEmail', inputVars);
};
getUserByEmailRef.operationName = 'GetUserByEmail';

export function getUserByEmail(vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;
export function getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;
export function getUserByEmail(dcOrVars: any, vars?: any): QueryPromise<GetUserByEmailData, GetUserByEmailVariables> {
  const { dc, vars: inputVars } = resolveDc(dcOrVars, vars);
  return executeQuery(getUserByEmailRef(dc, inputVars));
}
