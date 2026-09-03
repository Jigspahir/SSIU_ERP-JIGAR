# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateUser, useUpdateUser, useCreateAuditLog, useCreateBulkOperation, useListUsers, useGetUserById, useGetUserByEmail, useListUsersByRole, useListBulkOperations } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateUser(createUserVars);

const { data, isPending, isSuccess, isError, error } = useUpdateUser(updateUserVars);

const { data, isPending, isSuccess, isError, error } = useCreateAuditLog(createAuditLogVars);

const { data, isPending, isSuccess, isError, error } = useCreateBulkOperation(createBulkOperationVars);

const { data, isPending, isSuccess, isError, error } = useListUsers();

const { data, isPending, isSuccess, isError, error } = useGetUserById(getUserByIdVars);

const { data, isPending, isSuccess, isError, error } = useGetUserByEmail(getUserByEmailVars);

const { data, isPending, isSuccess, isError, error } = useListUsersByRole(listUsersByRoleVars);

const { data, isPending, isSuccess, isError, error } = useListBulkOperations();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, updateUser, createAuditLog, createBulkOperation, listUsers, getUserById, getUserByEmail, listUsersByRole, listBulkOperations } from '@dataconnect/generated';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation UpdateUser:  For variables, look at type UpdateUserVars in ../index.d.ts
const { data } = await UpdateUser(dataConnect, updateUserVars);

// Operation CreateAuditLog:  For variables, look at type CreateAuditLogVars in ../index.d.ts
const { data } = await CreateAuditLog(dataConnect, createAuditLogVars);

// Operation CreateBulkOperation:  For variables, look at type CreateBulkOperationVars in ../index.d.ts
const { data } = await CreateBulkOperation(dataConnect, createBulkOperationVars);

// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation GetUserById:  For variables, look at type GetUserByIdVars in ../index.d.ts
const { data } = await GetUserById(dataConnect, getUserByIdVars);

// Operation GetUserByEmail:  For variables, look at type GetUserByEmailVars in ../index.d.ts
const { data } = await GetUserByEmail(dataConnect, getUserByEmailVars);

// Operation ListUsersByRole:  For variables, look at type ListUsersByRoleVars in ../index.d.ts
const { data } = await ListUsersByRole(dataConnect, listUsersByRoleVars);

// Operation ListBulkOperations: 
const { data } = await ListBulkOperations(dataConnect);


```