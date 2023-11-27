import application from "src/models/application";

export default Object.freeze({
  "GET:CURRENT_SELECTION": {
    allowUnauthenticated: true,
    verifier: (session, resource) => true,
  },

  "GET:SELECTION_GROUPS": {
    allowUnauthenticated: false,
    verifier: (session, resource) => {
      if (session.email) {
        return true;
      }
    },
  },

  "POST:APPLICATIONS": {
    allowUnauthenticated: false,
    verifier: (session, resource) => {
      if (session.method === "root") {
        return true;
      }

      if (
        session.email &&
        resource?.email &&
        resource?.email === session.email
      ) {
        return true;
      }
    },
  },

  "GET:SOCIOECONOMIC": {
    allowUnauthenticated: false,
    verifier: (session, resource) => {
      if (session.email) {
        return true;
      }
    },
  },

  "POST:SOCIOECONOMIC_ANSWERS": {
    allowUnauthenticated: false,
    verifier: async (session, resource) => {
      if (!session.email) {
        return false;
      }

      if (session.method === "root") {
        return true;
      }

      const userApplications = await application.findByEmail(session.email);

      for (let index = 0; index < userApplications.length; index++) {
        const currentApplication = userApplications[index];

        if (currentApplication.id === resource.application_id) {
          return true;
        }
      }

      return false;
    },
  },

  "GET:APPLICATIONS_ORDERS": {
    allowUnauthenticated: false,
    verifier: async (session, resource) => {
      if (session.method === "root") {
        return true;
      }

      const applicationToAccess = await application.findById(
        resource.application_id,
      );

      if (applicationToAccess.email === session.email) {
        return true;
      }

      return false;
    },
  },

  "GET:APPLICATIONS_PAYMENTS": {
    allowUnauthenticated: false,
    verifier: async (session, resource) => {
      if (session.method === "root") {
        return true;
      }

      if (resource.email === session.email) {
        return true;
      }

      return false;
    },
  },

  "GET:APPLICATIONS": {
    allowUnauthenticated: false,
    verifier: async (session, resource) => {
      if (session.method === "root") {
        return true;
      }

      if (resource.email === session.email) {
        return true;
      }

      return false;
    },
  },

  "POST:ORDERS_PAYMENTS": {
    allowUnauthenticated: true,
    verifier: (session, resource) => true,
  },
});
