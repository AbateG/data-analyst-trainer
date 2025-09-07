import type { UserRecord, ApiRecord, TableStatus, EventPayload } from './types';

/**
 * Type guard for UserRecord
 */
export function isUserRecord(obj: any): obj is UserRecord {
  return obj && typeof obj === 'object' && ('user_id' in obj || 'amount' in obj || 'status' in obj);
}

/**
 * Type guard for ApiRecord
 */
export function isApiRecord(obj: any): obj is ApiRecord {
  return obj && typeof obj === 'object' && ('user_id' in obj || 'amount' in obj);
}

/**
 * Type guard for TableStatus
 */
export function isTableStatus(obj: any): obj is TableStatus {
  return obj && typeof obj === 'object' &&
         typeof obj.table === 'string' &&
         typeof obj.last_loaded_ts === 'string' &&
         typeof obj.sla_minutes === 'number';
}

/**
 * Type guard for EventPayload
 */
export function isEventPayload(obj: any): obj is EventPayload {
  return obj && typeof obj === 'object' &&
         (typeof obj.id === 'number' || obj.id === undefined) &&
         (Array.isArray(obj.events) || obj.events === undefined);
}

/**
 * Validate and cast data array for UserRecord
 */
export function validateUserRecords(data: any): UserRecord[] {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  return data.filter(isUserRecord);
}

/**
 * Validate and cast data array for ApiRecord
 */
export function validateApiRecords(data: any): ApiRecord[] {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  return data.filter(isApiRecord);
}

/**
 * Validate and cast data array for TableStatus
 */
export function validateTableStatuses(data: any): TableStatus[] {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  return data.filter(isTableStatus);
}

/**
 * Validate and cast data array for EventPayload
 */
export function validateEventPayloads(data: any): EventPayload[] {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  return data.filter(isEventPayload);
}
