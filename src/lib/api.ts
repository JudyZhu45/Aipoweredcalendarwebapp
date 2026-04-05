import { generateClient } from 'aws-amplify/api';

const client = generateClient({ authMode: 'apiKey' });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TodoTaskRecord {
  id: string;
  title: string;
  description: string;          // String! in schema — required
  isCompleted: boolean;
  dueDate?: string | null;
  // Schedule fields — present means this is a time-blocked event
  startTime?: string | null;
  endTime?: string | null;
  priority?: string | null;
  eventType?: string | null;
  notes?: string | null;
  // Routine linkage
  isFromRoutine?: boolean | null;
  routineId?: string | null;
  userId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  // DataStore conflict detection — required for update/delete
  _version?: number | null;
  _deleted?: boolean | null;
}

/** true = has startTime + endTime (calendar block), false = plain todo */
export function isSchedule(task: TodoTaskRecord): boolean {
  return !!task.startTime && !!task.endTime;
}

export interface RoutineRecord {
  id: string;
  title: string;
  description?: string | null;
  routineType: string;
  frequency: string;
  weekdays?: number[] | null;
  monthDays?: number[] | null;
  startTimeHour?: number | null;
  startTimeMinute?: number | null;
  endTimeHour?: number | null;
  endTimeMinute?: number | null;
  eventType?: string | null;
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
  userId?: string | null;
  createdAt?: string | null;
  // DataStore conflict detection — required for update/delete
  _version?: number | null;
  _deleted?: boolean | null;
}

// ─── TodoTask Queries ──────────────────────────────────────────────────────────

const LIST_TODOS = /* GraphQL */ `
  query ListTodoTasks {
    listTodoTasks {
      items {
        id
        title
        description
        isCompleted
        dueDate
        startTime
        endTime
        priority
        eventType
        isFromRoutine
        routineId
        userId
        createdAt
        updatedAt
        _version
        _deleted
      }
    }
  }
`;

const CREATE_TODO = /* GraphQL */ `
  mutation CreateTodoTask($input: CreateTodoTaskInput!) {
    createTodoTask(input: $input) {
      id
      title
      description
      isCompleted
      dueDate
      startTime
      endTime
      priority
      eventType
      isFromRoutine
      routineId
      userId
      createdAt
      updatedAt
      _version
    }
  }
`;

const UPDATE_TODO = /* GraphQL */ `
  mutation UpdateTodoTask($input: UpdateTodoTaskInput!) {
    updateTodoTask(input: $input) {
      id
      title
      description
      isCompleted
      dueDate
      startTime
      endTime
      priority
      eventType
      userId
      updatedAt
      _version
    }
  }
`;

const DELETE_TODO = /* GraphQL */ `
  mutation DeleteTodoTask($input: DeleteTodoTaskInput!) {
    deleteTodoTask(input: $input) {
      id
    }
  }
`;

// ─── Routine Queries ───────────────────────────────────────────────────────────

const LIST_ROUTINES = /* GraphQL */ `
  query ListRoutines {
    listRoutines {
      items {
        id
        title
        description
        routineType
        frequency
        weekdays
        monthDays
        startTimeHour
        startTimeMinute
        endTimeHour
        endTimeMinute
        eventType
        isActive
        startDate
        endDate
        userId
        createdAt
        _version
        _deleted
      }
    }
  }
`;

const CREATE_ROUTINE = /* GraphQL */ `
  mutation CreateRoutine($input: CreateRoutineInput!) {
    createRoutine(input: $input) {
      id
      title
      description
      routineType
      frequency
      weekdays
      monthDays
      startTimeHour
      startTimeMinute
      endTimeHour
      endTimeMinute
      eventType
      isActive
      startDate
      endDate
      userId
      createdAt
      _version
    }
  }
`;

const UPDATE_ROUTINE = /* GraphQL */ `
  mutation UpdateRoutine($input: UpdateRoutineInput!) {
    updateRoutine(input: $input) {
      id
      title
      isActive
      userId
      _version
    }
  }
`;

const DELETE_ROUTINE = /* GraphQL */ `
  mutation DeleteRoutine($input: DeleteRoutineInput!) {
    deleteRoutine(input: $input) {
      id
    }
  }
`;

// ─── TodoTask API ──────────────────────────────────────────────────────────────

export async function fetchTodos(): Promise<TodoTaskRecord[]> {
  try {
    const result = await client.graphql({ query: LIST_TODOS });
    const items = (result as any).data?.listTodoTasks?.items ?? [];
    // Filter out soft-deleted records (_deleted: true = DataStore tombstone)
    return items.filter((item: TodoTaskRecord) => !item._deleted);
  } catch (err: any) {
    console.error('fetchTodos error:', err?.message);
    return [];
  }
}

export async function createTodo(
  input: Omit<TodoTaskRecord, 'createdAt' | 'updatedAt'>
): Promise<TodoTaskRecord | null> {
  try {
    // Only strip _version — it is not part of CreateTodoTaskInput
    const { _version, ...cleanInput } = input;
    const result = await client.graphql({
      query: CREATE_TODO,
      variables: { input: cleanInput },
    });
    const created = (result as any).data.createTodoTask;
    return created;
  } catch (err: any) {
    console.error('createTodo error:', err?.message);
    return null;
  }
}

export async function updateTodo(
  input: Pick<TodoTaskRecord, 'id'> & Partial<TodoTaskRecord>
): Promise<TodoTaskRecord | null> {
  try {
    // _version is required by AppSync DataStore conflict detection
    const result = await client.graphql({
      query: UPDATE_TODO,
      variables: { input },
    });
    return (result as any).data.updateTodoTask;
  } catch (err) {
    console.error('updateTodo error:', err);
    return null;
  }
}

export async function deleteTodo(id: string, version: number): Promise<boolean> {
  try {
    await client.graphql({
      query: DELETE_TODO,
      variables: { input: { id, _version: version } },
    });
    return true;
  } catch (err: any) {
    console.error('[deleteTodo] error:', err?.message);
    return false;
  }
}

// ─── UserPreference ────────────────────────────────────────────────────────────

export interface UserPreferenceRecord {
  id: string;
  category: string;
  content: string;
  source: string;
  confirmedCount: number;
  isTemporary: boolean;
  expiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  _version?: number | null;
  _deleted?: boolean | null;
}

const LIST_USER_PREFERENCES = /* GraphQL */ `
  query ListUserPreferences {
    listUserPreferences {
      items {
        id
        category
        content
        source
        confirmedCount
        isTemporary
        expiresAt
        createdAt
        updatedAt
        _version
        _deleted
      }
    }
  }
`;

const CREATE_USER_PREFERENCE = /* GraphQL */ `
  mutation CreateUserPreference($input: CreateUserPreferenceInput!) {
    createUserPreference(input: $input) {
      id
      category
      content
      source
      confirmedCount
      isTemporary
      expiresAt
      createdAt
      updatedAt
      _version
    }
  }
`;

const UPDATE_USER_PREFERENCE = /* GraphQL */ `
  mutation UpdateUserPreference($input: UpdateUserPreferenceInput!) {
    updateUserPreference(input: $input) {
      id
      category
      content
      source
      confirmedCount
      isTemporary
      expiresAt
      updatedAt
      _version
    }
  }
`;

const DELETE_USER_PREFERENCE = /* GraphQL */ `
  mutation DeleteUserPreference($input: DeleteUserPreferenceInput!) {
    deleteUserPreference(input: $input) {
      id
    }
  }
`;

export async function fetchPreferences(): Promise<UserPreferenceRecord[]> {
  try {
    const result = await client.graphql({ query: LIST_USER_PREFERENCES });
    const items = (result as any).data?.listUserPreferences?.items ?? [];
    return items.filter((item: UserPreferenceRecord) => !item._deleted);
  } catch (err: any) {
    console.error('fetchPreferences error:', err?.message);
    return [];
  }
}

export async function createPreference(
  input: Omit<UserPreferenceRecord, 'createdAt' | 'updatedAt'>
): Promise<UserPreferenceRecord | null> {
  try {
    const { _version, ...cleanInput } = input;
    const result = await client.graphql({
      query: CREATE_USER_PREFERENCE,
      variables: { input: cleanInput },
    });
    return (result as any).data.createUserPreference;
  } catch (err: any) {
    console.error('createPreference error:', err?.message);
    return null;
  }
}

export async function updatePreference(
  input: Pick<UserPreferenceRecord, 'id'> & Partial<UserPreferenceRecord>
): Promise<UserPreferenceRecord | null> {
  try {
    const result = await client.graphql({
      query: UPDATE_USER_PREFERENCE,
      variables: { input },
    });
    return (result as any).data.updateUserPreference;
  } catch (err: any) {
    console.error('updatePreference error:', err?.message);
    return null;
  }
}

export async function deletePreference(id: string, version: number): Promise<boolean> {
  try {
    await client.graphql({
      query: DELETE_USER_PREFERENCE,
      variables: { input: { id, _version: version } },
    });
    return true;
  } catch (err: any) {
    console.error('deletePreference error:', err?.message);
    return false;
  }
}

// ─── Routine API ───────────────────────────────────────────────────────────────

export async function fetchRoutines(): Promise<RoutineRecord[]> {
  try {
    const result = await client.graphql({ query: LIST_ROUTINES });
    const items = (result as any).data.listRoutines.items ?? [];
    return items.filter((r: any) => !r._deleted);
  } catch (err) {
    console.error('fetchRoutines error:', err);
    return [];
  }
}

export async function createRoutine(
  input: Omit<RoutineRecord, 'createdAt' | 'updatedAt'>
): Promise<RoutineRecord | null> {
  try {
    const { _version, ...cleanInput } = input as any;
    const result = await client.graphql({
      query: CREATE_ROUTINE,
      variables: { input: cleanInput },
    });
    return (result as any).data.createRoutine;
  } catch (err: any) {
    console.error('createRoutine error:', err?.message);
    return null;
  }
}

export async function updateRoutine(
  input: Pick<RoutineRecord, 'id'> & Partial<RoutineRecord>
): Promise<RoutineRecord | null> {
  try {
    // _version is required by AppSync DataStore conflict detection
    const result = await client.graphql({
      query: UPDATE_ROUTINE,
      variables: { input },
    });
    return (result as any).data.updateRoutine;
  } catch (err) {
    console.error('updateRoutine error:', err);
    return null;
  }
}

export async function deleteRoutine(id: string, version: number): Promise<boolean> {
  try {
    await client.graphql({
      query: DELETE_ROUTINE,
      variables: { input: { id, _version: version } },
    });
    return true;
  } catch (err: any) {
    console.error('deleteRoutine error:', err?.message);
    return false;
  }
}
