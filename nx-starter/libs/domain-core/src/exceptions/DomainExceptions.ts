/**
 * Base domain exception
 */
export abstract class DomainException extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Todo-specific domain exceptions
 */
export class TodoNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Todo with ID ${id} not found`, 'TODO_NOT_FOUND');
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
 * Authentication-specific domain exceptions
 */
export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`User with identifier ${identifier} not found`, 'USER_NOT_FOUND');
  }
}

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} already exists`, 'USER_ALREADY_EXISTS');
  }
}

export class InvalidPasswordException extends DomainException {
  constructor(reason: string) {
    super(`Invalid password: ${reason}`, 'INVALID_PASSWORD');
  }
}

export class InvalidEmailException extends DomainException {
  constructor(reason: string) {
    super(`Invalid email: ${reason}`, 'INVALID_EMAIL');
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
  }
}

export class TokenExpiredException extends DomainException {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED');
  }
}

export class TokenRevokedException extends DomainException {
  constructor() {
    super('Token has been revoked', 'TOKEN_REVOKED');
  }
}

export class InvalidTokenException extends DomainException {
  constructor(reason: string) {
    super(`Invalid token: ${reason}`, 'INVALID_TOKEN');
  }
}
