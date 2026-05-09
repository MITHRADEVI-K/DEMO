/**
 * Sample User Service
 * Test file to validate CodeRabbit configuration
 */

class UserService {
  constructor(database, logger) {
    this.db = database;
    this.logger = logger;
  }

  /**
   * Get user by ID
   * @param {number} userId - The user ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    // Input validation
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (typeof userId !== 'number' || userId <= 0) {
      throw new Error('User ID must be a positive number');
    }

    try {
      this.logger.info(`Fetching user with ID: ${userId}`);
      const user = await this.db.query('SELECT * FROM users WHERE id = ?', [userId]);

      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`Error fetching user ${userId}:`, error);
      throw new Error('Failed to fetch user');
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    // Input validation
    if (!userData) {
      throw new Error('User data is required');
    }

    const { email, name, role } = userData;

    // Validate required fields
    if (!email || !name) {
      throw new Error('Email and name are required');
    }

    // Validate email format
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate role
    const validRoles = ['admin', 'user', 'guest'];
    if (role && !validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    try {
      this.logger.info(`Creating user: ${email}`);

      // Check if user already exists
      const existingUser = await this.db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const newUser = await this.db.query(
        'INSERT INTO users (email, name, role) VALUES (?, ?, ?)',
        [email, name, role || 'user']
      );

      this.logger.info(`User created successfully: ${newUser.id}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Error creating user:`, error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updates) {
    // Input validation
    if (!userId || !updates) {
      throw new Error('User ID and update data are required');
    }

    if (typeof userId !== 'number' || userId <= 0) {
      throw new Error('User ID must be a positive number');
    }

    try {
      // Verify user exists
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      this.logger.info(`Updating user: ${userId}`);

      const updatedUser = await this.db.query(
        'UPDATE users SET ? WHERE id = ?',
        [updates, userId]
      );

      this.logger.info(`User updated successfully: ${userId}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user ${userId}:`, error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Deletion success
   */
  async deleteUser(userId) {
    // Input validation
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (typeof userId !== 'number' || userId <= 0) {
      throw new Error('User ID must be a positive number');
    }

    try {
      this.logger.info(`Deleting user: ${userId}`);

      const result = await this.db.query('DELETE FROM users WHERE id = ?', [userId]);

      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }

      this.logger.info(`User deleted successfully: ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting user ${userId}:`, error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = UserService;
