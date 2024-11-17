export type SessionData = {
  id: string;
  createdAt: number;
};

export class SessionStore {
  private static instance: SessionStore;
  private sessions: Map<string, SessionData> = new Map();
  private cleanupIntervalId?: NodeJS.Timeout;

  private constructor() {
    this.sessions = new Map();
    this.startCleanup();
  }

  /**
   * Retrieves the singleton instance of the SessionStore.
   *
   * This static method ensures that only one instance of the SessionStore
   * is created and returned. If an instance does not already exist, a new
   * instance is created. This pattern is useful for managing session data
   * in a centralized manner throughout the application.
   *
   * @returns {SessionStore} - The singleton instance of the SessionStore.
   */
  static getInstance = (): SessionStore => {
    if (!SessionStore.instance) {
      SessionStore.instance = new SessionStore();
    }

    return SessionStore.instance;
  };

  /**
   * Sets a session in the session store.
   *
   * This method adds a new session or updates an existing session
   * in the store with the provided session ID and data.
   *
   * @param {string} id - The unique identifier for the session.
   * @param {SessionData} data - The session data to be stored, which includes
   *                             the session's creation timestamp and any other
   *                             relevant information.
   *
   * @returns {void}
   */
  set = (id: string, data: SessionData): void => {
    this.sessions.set(id, data);
  };

  /**
   * Retrieves a session from the session store by its unique identifier.
   *
   * This method looks up the session data associated with the provided session ID.
   * If a session with the given ID exists, it returns the corresponding session data.
   * If no session is found, it returns `undefined`.
   *
   * @param {string} id - The unique identifier for the session to retrieve.
   * @returns {SessionData | undefined} - The session data if found, otherwise `undefined`.
   */
  get = (id: string): SessionData | undefined => {
    return this.sessions.get(id);
  };

  /**
   * Deletes a session from the session store by its unique identifier.
   *
   * This method removes the session data associated with the provided session ID
   * from the store. If the session ID does not exist, no action is taken.
   *
   * @param {string} id - The unique identifier for the session to be deleted.
   * @returns {void}
   */
  delete = (id: string): void => {
    this.sessions.delete(id);
  };

  /**
   * Initiates a cleanup process for expired sessions in the session store.
   *
   * This method sets up an interval that checks for sessions that have
   * exceeded the specified maximum age. If a session's age surpasses
   * the `maxAge`, it will be deleted from the store.
   *
   * The default maximum age is set to 24 hours (in milliseconds).
   * The cleanup process runs every hour (60 minutes).
   *
   * @param {number} maxAge - The maximum age of sessions in milliseconds.
   *                          Sessions older than this will be removed.
   *                          Defaults to 24 hours (24 * 60 * 60 * 1000).
   * @returns {void}
   */
  private startCleanup = (maxAge: number = 24 * 60 * 60 * 1000): void => {
    if (this.cleanupIntervalId) return;

    this.cleanupIntervalId = setInterval(() => {
      const now = Date.now();
      this.sessions.forEach((data, id) => {
        if (now - data.createdAt > maxAge) {
          this.delete(id);
        }
      });
    }, 60 * 60 * 1000); // Cleanup every hour
  };
}
