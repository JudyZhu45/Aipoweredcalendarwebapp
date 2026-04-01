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
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
  userId?: string | null;
  createdAt?: string | null;
  // DataStore conflict detection — required for update/delete
  _version?: number | null;
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
        isActive
        startDate
        endDate
        userId
        createdAt
        _version
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
      isActive
      startDate
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
    console.log('[api] fetchTodos raw result:', JSON.stringify(result, null, 2));
    // Filter out soft-deleted records (_deleted: true = DataStore tombstone)
    return items.filter((item: TodoTaskRecord) => !item._deleted);
  } catch (err: any) {
    console.error('fetchTodos error — full details:');
    console.error('  message:', err?.message);
    console.error('  errors:', JSON.stringify(err?.errors, null, 2));
    console.error('  raw:', JSON.stringify(err, null, 2));
    return [];
  }
}

export async function createTodo(
  input: Omit<TodoTaskRecord, 'createdAt' | 'updatedAt'>
): Promise<TodoTaskRecord | null> {
  try {
    // Only strip _version — it is not part of CreateTodoTaskInput
    const { _version, ...cleanInput } = input;
    console.log('[createTodo] sending input:', JSON.stringify(cleanInput, null, 2));
    const result = await client.graphql({
      query: CREATE_TODO,
      variables: { input: cleanInput },
    });
    const created = (result as any).data.createTodoTask;
    console.log('[createTodo] success, returned:', JSON.stringify(created, null, 2));
    return created;
  } catch (err: any) {
    console.error('createTodo error — message:', err?.message);
    console.error('createTodo error — errors:', JSON.stringify(err?.errors, null, 2));
    console.error('createTodo error — raw:', JSON.stringify(err, null, 2));
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
    console.log('[deleteTodo] deleting id:', id, 'version:', version);
    await client.graphql({
      query: DELETE_TODO,
      variables: { input: { id, _version: version } },
    });
    console.log('[deleteTodo] success');
    return true;
  } catch (err: any) {
    console.error('[deleteTodo] error — errors:', JSON.stringify(err?.errors, null, 2));
    console.error('[deleteTodo] error — raw:', JSON.stringify(err, null, 2));
    return false;
  }
}

// ─── Routine API ───────────────────────────────────────────────────────────────

export async function fetchRoutines(): Promise<RoutineRecord[]> {
  try {
    const result = await client.graphql({ query: LIST_ROUTINES });
    return (result as any).data.listRoutines.items ?? [];
  } catch (err) {
    console.error('fetchRoutines error:', err);
    return [];
  }
}

export async function createRoutine(
  input: Omit<RoutineRecord, 'createdAt' | 'updatedAt'>
): Promise<RoutineRecord | null> {
  try {
    const result = await client.graphql({
      query: CREATE_ROUTINE,
      variables: { input },
    });
    return (result as any).data.createRoutine;
  } catch (err) {
    console.error('createRoutine error:', err);
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
  } catch (err) {
    console.error('deleteRoutine error:', err);
    return false;
  }
}
