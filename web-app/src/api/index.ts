export * from './types';

export { organizationsApi } from './endpoints/organizations';
export { usersApi } from './endpoints/users';
export { incidentsApi } from './endpoints/incidents';
export { threatActorsApi } from './endpoints/threat-actors';
export { cvesApi } from './endpoints/cves';
export { generateAISummary } from './endpoints/ai';

import { organizationsApi } from './endpoints/organizations';
import { usersApi } from './endpoints/users';
import { incidentsApi } from './endpoints/incidents';
import { threatActorsApi } from './endpoints/threat-actors';
import { cvesApi } from './endpoints/cves';

export const fetchOrganizations = organizationsApi.getAll;
export const fetchUsers = usersApi.getAll;
export const fetchIncidents = incidentsApi.getAll;
export const fetchThreatActors = threatActorsApi.getAll;
export const fetchLatestCVEs = cvesApi.getShodanLatest; 
