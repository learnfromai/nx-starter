/**
 * Base domain exception
 */
export abstract class DomainException extends Error {
  constructor(
    message: string, 
    public readonly code: string, 
    public readonly statusCode = 400
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Todo-specific domain exceptions
 */
export class TodoNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Todo with ID ${id} not found`, 'TODO_NOT_FOUND', 404);
  }
}

export class TodoAlreadyCompletedException extends DomainException {
  constructor() {
    super('Todo is already completed', 'TODO_ALREADY_COMPLETED');
  }
}

export class InvalidTodoTitleException extends DomainException {
  constructor(reason: string) {
    super(`Invalid todo title: ${reason}`, 'INVALID_TODO_TITLE');
  }
}

export class InvalidTodoPriorityException extends DomainException {
  constructor(priority: string) {
    super(`Invalid todo priority: ${priority}`, 'INVALID_TODO_PRIORITY');
  }
}

/**
 * User-specific domain exceptions
 */
export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`User with identifier ${identifier} not found`, 'USER_NOT_FOUND', 404);
  }
}

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super('Email address already registered', 'REG_EMAIL_EXISTS', 409);
  }
}

export class InvalidEmailException extends DomainException {
  constructor(reason: string) {
    super(reason, 'REG_INVALID_EMAIL');
  }
}

export class InvalidUsernameException extends DomainException {
  constructor(reason: string) {
    super(reason, 'INVALID_USERNAME');
  }
}

export class InvalidPasswordException extends DomainException {
  constructor(reason: string) {
    super(reason, 'REG_WEAK_PASSWORD');  
  }
}

export class InvalidNameException extends DomainException {
  constructor(reason: string) {
    super(reason, 'REG_INVALID_NAME');
  }
}

export class InvalidUserIdException extends DomainException {
  constructor(reason: string) {
    super(reason, 'INVALID_USER_ID');
  }
}
