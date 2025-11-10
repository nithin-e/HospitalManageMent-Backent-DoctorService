export const MESSAGES = {
    CREATE: {
        SUCCESS: 'Appointment booked successfully',
        FAILED: 'Failed to store appointment',
        SLOT_NOT_FOUND: 'Appointment slot not found',
        SLOT_ALREADY_BOOKED: 'This appointment slot is already booked',
        PAYMENT_SUCCESS: 'Appointment created successfully from payment',
        PAYMENT_FAILED: 'Error while handling payment event',
    },
    FETCH: {
        SUCCESS: 'Appointments fetched successfully',
        FAILED: 'Failed to fetch appointments',
        NO_APPOINTMENTS: 'No appointments found for this email',
        NO_APPOINTMENTS_PAGE: 'No appointments found for page',
        ALL_SUCCESS: 'All appointments fetched successfully',
        ALL_FAILED: 'Failed to fetch all appointments',
    },
    CANCEL: {
        SUCCESS: 'Appointment cancelled successfully',
        FAILED: 'Failed to cancel appointment',
        NOT_FOUND: 'Appointment not found',
        ALREADY_CANCELLED: 'Appointment not found or already cancelled',
        USER_SUCCESS: 'Appointment cancelled successfully by user',
        DOCTOR_SUCCESS: 'Appointment cancelled successfully by doctor',
        SLOT_UPDATE_WARNING: 'Appointment cancelled successfully, but slot availability could not be updated',
        SLOT_SUCCESS: 'Appointment cancelled successfully and slot is now available',
    },
    RESCHEDULE: {
        SUCCESS: 'Appointment rescheduled successfully',
        FAILED: 'Failed to reschedule appointment',
        ORIGINAL_SLOT_NOT_FOUND: 'Original slot not found or could not be deleted',
        APPOINTMENT_NOT_FOUND: 'User appointment not found',
        UPDATE_FAILED: 'Failed to update user appointment',
    },
    UPDATE: {
        SUCCESS: 'Appointment updated successfully',
        FAILED: 'Failed to update appointment',
        AFTER_CONSULTATION_SUCCESS: 'Appointment updated after consultation',
        AFTER_CONSULTATION_FAILED: 'Failed to update appointment after consultation',
        STATUS_CHANGED: 'Appointment status changed to completed',
    },
    FILTER: {
        SUCCESS: 'Doctor appointments filtered successfully',
        FAILED: 'Failed to filter appointments',
    },
    VALIDATION: {
        APPOINTMENT_ID_REQUIRED: 'Appointment ID is required',
        BOTH_FIELDS_REQUIRED: 'Both appointmentId and endedBy are required',
        MISSING_FIELDS: 'Missing required fields: time, date, or email',
        INVALID_DATA: 'Invalid appointment data provided',
    },
    ERROR: {
        INTERNAL_SERVER_ERROR: 'Internal server error',
        DATABASE_ERROR: 'Database error occurred',
        SERVICE_LAYER_ERROR: 'Service layer error occurred',
        REPOSITORY_LAYER_ERROR: 'Repository layer error occurred',
    },
};

export const CHAT_MESSAGES = {
    STORE: {
        SUCCESS: 'Message stored successfully',
        FAILED: 'Failed to store message',
        DB_ERROR: 'Database error occurred while storing message',
        CHAT_CREATED: 'New chat created successfully',
        CHAT_UPDATED: 'Chat updated successfully',
        MESSAGE_SAVED: 'Message saved successfully',
    },
    FETCH: {
        SUCCESS: 'Conversations fetched successfully',
        FAILED: 'Failed to fetch conversations',
        NO_CONVERSATIONS: 'No conversations found',
        EMPTY_RESULT: 'No conversations available',
    },
    VALIDATION: {
        USER_ID_REQUIRED: 'User ID is required',
        DOCTOR_ID_REQUIRED: 'Doctor ID is required',
        BOTH_IDS_REQUIRED: 'Both userId and doctorId are required',
        INVALID_MESSAGE_DATA: 'Invalid message data provided',
        MISSING_FIELDS: 'Missing required fields',
    },
    ERROR: {
        INTERNAL_SERVER_ERROR: 'Internal server error',
        DATABASE_ERROR: 'Database error occurred',
        SERVICE_LAYER_ERROR: 'Service layer error occurred',
        REPOSITORY_LAYER_ERROR: 'Repository layer error occurred',
        UNKNOWN_ERROR: 'Unknown error occurred',
        STORAGE_FAILED: 'Error storing message in database',
    },
};


export const PRESCRIPTION_MESSAGES = {
    CREATE: {
        SUCCESS: 'Prescription created successfully',
        FAILED: 'Failed to create prescription',
        SAVED: 'Prescription saved successfully',
        APPOINTMENT_UPDATED: 'Appointment updated with prescription status',
    },
    FETCH: {
        SUCCESS: 'Prescriptions fetched successfully',
        FAILED: 'Failed to fetch prescription',
        NOT_FOUND: 'Prescription not found',
        APPOINTMENT_NOT_FOUND: 'Appointment not found',
        NO_PRESCRIPTIONS: 'No prescriptions available',
    },
    VALIDATION: {
        APPOINTMENT_ID_REQUIRED: 'Appointment ID is required',
        DOCTOR_ID_REQUIRED: 'Doctor ID is required',
        PATIENT_ID_REQUIRED: 'Patient ID is required',
        PRESCRIPTION_DETAILS_REQUIRED: 'Prescription details are required',
        INVALID_DATA: 'Invalid prescription data provided',
        MISSING_FIELDS: 'Missing required fields',
    },
    ERROR: {
        INTERNAL_SERVER_ERROR: 'Internal server error',
        DATABASE_ERROR: 'Database error occurred',
        SERVICE_LAYER_ERROR: 'Service layer error occurred',
        REPOSITORY_LAYER_ERROR: 'Repository layer error occurred',
        UNKNOWN_ERROR: 'Unknown error occurred',
        SAVE_FAILED: 'Error saving prescription',
    },
};


export const SERVICE_MESSAGES = {
    CREATE: {
        SUCCESS: 'Service created successfully',
        FAILED: 'Failed to create service',
        DUPLICATE: 'Service with this name already exists',
    },
    FETCH: {
        SUCCESS: 'Services fetched successfully',
        FAILED: 'Failed to fetch services',
        NO_SERVICES: 'No services found',
        EMPTY_RESULT: 'No services available',
    },
    DELETE: {
        SUCCESS: 'Service deleted successfully',
        FAILED: 'Failed to delete service',
        NOT_FOUND: 'Service not found',
    },
    UPDATE: {
        SUCCESS: 'Service updated successfully',
        FAILED: 'Failed to update service',
        NOT_FOUND: 'Service not found',
        NO_CHANGES: 'No changes to update',
    },
    VALIDATION: {
        NAME_REQUIRED: 'Service name is required',
        DESCRIPTION_REQUIRED: 'Service description is required',
        SERVICE_ID_REQUIRED: 'Service ID is required',
        INVALID_SERVICE_ID: 'Invalid service ID format',
        NAME_TOO_SHORT: 'Service name must be at least 3 characters',
        NAME_TOO_LONG: 'Service name must not exceed 100 characters',
        DESCRIPTION_TOO_SHORT: 'Description must be at least 10 characters',
        INVALID_DATA: 'Invalid service data provided',
    },
    ERROR: {
        INTERNAL_SERVER_ERROR: 'Internal server error',
        DATABASE_ERROR: 'Database error occurred',
        SERVICE_LAYER_ERROR: 'Service layer error occurred',
        REPOSITORY_LAYER_ERROR: 'Repository layer error occurred',
        UNKNOWN_ERROR: 'Unknown error occurred',
        CREATE_FAILED: 'Error creating service in repository',
        FETCH_FAILED: 'Error fetching services from repository',
        DELETE_FAILED: 'Error deleting service in repository',
        UPDATE_FAILED: 'Error editing service in repository',
    },
};



export const SLOT_MESSAGES = {
    CREATE: {
        SUCCESS: 'Appointment slots created successfully',
        FAILED: 'Failed to create appointment slots',
        PARTIAL_SUCCESS: 'Some appointment slots were created successfully',
        DUPLICATE_SKIPPED: 'Duplicate slots were skipped',
        RECURRING_CREATED: 'Recurring appointment slots created successfully',
    },
    FETCH: {
        SUCCESS: 'Appointment slots fetched successfully',
        DOCTOR_SLOTS_SUCCESS: 'Doctor slots fetched successfully',
        DOCTOR_SLOTS_RETRIEVED: 'Doctor appointment slots retrieved successfully',
        FAILED: 'Failed to fetch appointment slots',
        NO_SLOTS: 'No appointment slots found for this doctor',
        EMPTY_RESULT: 'No appointment slots available',
    },
    UPDATE: {
        SUCCESS: 'Appointment slots updated successfully',
        FAILED: 'Failed to update appointment slots',
        PARTIAL_REMOVAL: 'Some slots could not be removed (may be booked or not found)',
        SLOTS_REMOVED: 'Appointment slots removed successfully',
        SLOTS_ADDED: 'New appointment slots added successfully',
        NO_CHANGES: 'No changes were made to appointment slots',
    },
    DELETE: {
        SUCCESS: 'Appointment slot deleted successfully',
        FAILED: 'Failed to delete appointment slot',
        BOOKED_SLOT: 'Cannot delete a booked appointment slot',
        NOT_FOUND: 'Appointment slot not found',
    },
    VALIDATION: {
        DOCTOR_EMAIL_REQUIRED: 'Doctor email is required',
        ACTION_REQUIRED: 'Action (create/update) is required',
        INVALID_ACTION: "Invalid action. Must be 'create' or 'update'",
        APPOINTMENT_SETTINGS_REQUIRED: 'Appointment settings are required',
        SELECTED_DATES_REQUIRED: 'Selected dates are required for creating slots',
        TIME_SLOTS_REQUIRED: 'Time slots are required for creating slots',
        UPDATE_DATA_REQUIRED: 'At least one of removed slots or new slots is required for update',
        INVALID_DATE_FORMAT: 'Invalid date format',
        INVALID_TIME_FORMAT: 'Invalid time format',
        START_TIME_REQUIRED: 'Start time is required',
        END_TIME_REQUIRED: 'End time is required',
        SLOT_DURATION_REQUIRED: 'Slot duration is required',
        INVALID_DURATION: 'Invalid slot duration',
        END_TIME_BEFORE_START: 'End time must be after start time',
        RECURRING_MONTHS_INVALID: 'Recurring months must be between 1 and 12',
    },
    ERROR: {
        INTERNAL_SERVER_ERROR: 'Internal server error',
        DATABASE_ERROR: 'Database error occurred',
        SERVICE_LAYER_ERROR: 'Service layer error occurred',
        REPOSITORY_LAYER_ERROR: 'Repository layer error occurred',
        UNKNOWN_ERROR: 'Unknown error occurred',
        FETCH_FAILED: 'Error fetching doctor slots',
        CREATE_FAILED: 'Error in createAppointmentSlots',
        UPDATE_FAILED: 'Error in updateAppointmentSlots',
        STORE_FAILED: 'Error in appointment slots repository',
        INSERT_FAILED: 'Error inserting appointment slots',
        NEW_SLOTS_FAILED: 'Error creating new appointment slots',
    },
};