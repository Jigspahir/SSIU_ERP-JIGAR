import { CreateUserData, CreateUserVariables, UpdateUserData, UpdateUserVariables, CreateAuditLogData, CreateAuditLogVariables, CreateBulkOperationData, CreateBulkOperationVariables, ListUsersData, GetUserByIdData, GetUserByIdVariables, GetUserByEmailData, GetUserByEmailVariables, ListUsersByRoleData, ListUsersByRoleVariables, ListBulkOperationsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useUpdateUser(options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, UpdateUserVariables>): UseDataConnectMutationResult<UpdateUserData, UpdateUserVariables>;
export function useUpdateUser(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, UpdateUserVariables>): UseDataConnectMutationResult<UpdateUserData, UpdateUserVariables>;

export function useCreateAuditLog(options?: useDataConnectMutationOptions<CreateAuditLogData, FirebaseError, CreateAuditLogVariables>): UseDataConnectMutationResult<CreateAuditLogData, CreateAuditLogVariables>;
export function useCreateAuditLog(dc: DataConnect, options?: useDataConnectMutationOptions<CreateAuditLogData, FirebaseError, CreateAuditLogVariables>): UseDataConnectMutationResult<CreateAuditLogData, CreateAuditLogVariables>;

export function useCreateBulkOperation(options?: useDataConnectMutationOptions<CreateBulkOperationData, FirebaseError, CreateBulkOperationVariables>): UseDataConnectMutationResult<CreateBulkOperationData, CreateBulkOperationVariables>;
export function useCreateBulkOperation(dc: DataConnect, options?: useDataConnectMutationOptions<CreateBulkOperationData, FirebaseError, CreateBulkOperationVariables>): UseDataConnectMutationResult<CreateBulkOperationData, CreateBulkOperationVariables>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;

export function useGetUserById(vars: GetUserByIdVariables, options?: useDataConnectQueryOptions<GetUserByIdData>): UseDataConnectQueryResult<GetUserByIdData, GetUserByIdVariables>;
export function useGetUserById(dc: DataConnect, vars: GetUserByIdVariables, options?: useDataConnectQueryOptions<GetUserByIdData>): UseDataConnectQueryResult<GetUserByIdData, GetUserByIdVariables>;

export function useGetUserByEmail(vars: GetUserByEmailVariables, options?: useDataConnectQueryOptions<GetUserByEmailData>): UseDataConnectQueryResult<GetUserByEmailData, GetUserByEmailVariables>;
export function useGetUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables, options?: useDataConnectQueryOptions<GetUserByEmailData>): UseDataConnectQueryResult<GetUserByEmailData, GetUserByEmailVariables>;

export function useListUsersByRole(vars: ListUsersByRoleVariables, options?: useDataConnectQueryOptions<ListUsersByRoleData>): UseDataConnectQueryResult<ListUsersByRoleData, ListUsersByRoleVariables>;
export function useListUsersByRole(dc: DataConnect, vars: ListUsersByRoleVariables, options?: useDataConnectQueryOptions<ListUsersByRoleData>): UseDataConnectQueryResult<ListUsersByRoleData, ListUsersByRoleVariables>;

export function useListBulkOperations(options?: useDataConnectQueryOptions<ListBulkOperationsData>): UseDataConnectQueryResult<ListBulkOperationsData, undefined>;
export function useListBulkOperations(dc: DataConnect, options?: useDataConnectQueryOptions<ListBulkOperationsData>): UseDataConnectQueryResult<ListBulkOperationsData, undefined>;
