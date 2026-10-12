import http from 'http';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:8080';

async function request(method, path, body = null, headers = {}) {
  const url = new URL(path, BASE_URL);
  const options = {
    method,
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('NALENTRA RUNTIME AUTH & SECURITY E2E VALIDATION');
  console.log('====================================================\n');

  let platformSessionId = null;
  let platformIdentityId = null;
  let testCustomerId = null;
  let testTenantId = null;
  let tenantAdminIdentityId = null;
  let tenantSessionId = null;
  let createdWorkspaceId = null;

  // ----------------------------------------------------
  // 1. PLATFORM BOOTSTRAP AUTHENTICATION (WITHOUT TENANT ID)
  // ----------------------------------------------------
  console.log('--- TEST 1: Platform Super Admin Login WITHOUT Tenant ID ---');
  const platformLoginRes = await request('POST', '/api/v1/authentication/authenticate', {
    username: 'superadmin',
    credentialRaw: 'PlatformAdmin#2026!',
    credentialType: 'PASSWORD',
  });

  console.log('Login Response Status:', platformLoginRes.status);
  console.log('Login Response Body:', JSON.stringify(platformLoginRes.body, null, 2));

  if (platformLoginRes.status !== 200 || !platformLoginRes.body?.data?.sessionId) {
    throw new Error('TEST 1 FAILED: Platform Super Admin login without tenantId failed!');
  }
  platformSessionId = platformLoginRes.body.data.sessionId;
  platformIdentityId = platformLoginRes.body.data.identityId;
  console.log('>>> TEST 1 PASSED: Platform Super Admin logged in successfully without tenantId.\n');

  // ----------------------------------------------------
  // 2. PLATFORM SESSION RESTORATION
  // ----------------------------------------------------
  console.log('--- TEST 2: Platform Session Restoration via /session ---');
  const sessionRes = await request('GET', '/api/v1/authentication/session', null, {
    'X-Session-ID': platformSessionId,
  });
  console.log('Session Status:', sessionRes.status);
  console.log('Session Body:', JSON.stringify(sessionRes.body, null, 2));

  if (sessionRes.status !== 200 || sessionRes.body?.data?.status !== 'ACTIVE') {
    throw new Error('TEST 2 FAILED: Platform session restoration failed!');
  }
  console.log('>>> TEST 2 PASSED: Real backend session restored and ACTIVE.\n');

  // ----------------------------------------------------
  // 3. PLATFORM IDENTITY & ROLE RESOLUTION
  // ----------------------------------------------------
  console.log('--- TEST 3: Platform Identity Profile & Authorization Resolution ---');
  const identityRes = await request('GET', `/api/v1/identities/${platformIdentityId}`, null, {
    'X-Session-ID': platformSessionId,
  });
  console.log('Identity Status:', identityRes.status);
  console.log('Identity Body:', JSON.stringify(identityRes.body, null, 2));

  if (identityRes.status !== 200 || identityRes.body?.data?.tenantId != null) {
    throw new Error('TEST 3 FAILED: Identity tenantId is not null for Platform Super Admin!');
  }

  const authRolesRes = await request('GET', `/api/v1/authorization/identities/${platformIdentityId}/roles`, null, {
    'X-Session-ID': platformSessionId,
  });
  console.log('Authorization Roles Status:', authRolesRes.status);
  console.log('Authorization Roles Body:', JSON.stringify(authRolesRes.body, null, 2));

  const roles = authRolesRes.body?.data || [];
  const superAdminRole = roles.find((r) => r.code === 'PLATFORM_SUPER_ADMIN');
  if (!superAdminRole) {
    throw new Error('TEST 3 FAILED: PLATFORM_SUPER_ADMIN role not assigned to platform identity!');
  }
  console.log('Platform Permissions:', superAdminRole.permissions);
  console.log('>>> TEST 3 PASSED: Platform identity has tenantId=null and backend-assigned PLATFORM_SUPER_ADMIN role.\n');

  // ----------------------------------------------------
  // 4. PLATFORM OPERATION: CREATE CUSTOMER
  // ----------------------------------------------------
  console.log('--- TEST 4: Platform Super Admin Creates Real Customer ---');
  const uniqueCode = 'CUST' + Date.now().toString().slice(-6);
  const custRes = await request('POST', '/api/v1/customers', {
    customerCode: uniqueCode,
    legalName: 'E2E Enterprise Customer ' + uniqueCode + ' LLC',
    displayName: 'E2E Enterprise Customer ' + uniqueCode,
    customerType: 'ENTERPRISE',
    industry: 'EDUCATION',
    primaryContactName: 'John Doe',
    primaryEmail: `admin@${uniqueCode.toLowerCase()}.com`,
    primaryPhone: '+1-555-0199',
    timezone: 'UTC',
    currency: 'USD',
  }, {
    'X-Session-ID': platformSessionId,
  });
  console.log('Create Customer Status:', custRes.status);
  console.log('Create Customer Body:', JSON.stringify(custRes.body, null, 2));

  if (custRes.status !== 201 && custRes.status !== 200) {
    throw new Error('TEST 4 FAILED: Customer creation failed!');
  }
  testCustomerId = custRes.body.data.id;
  console.log('Created Customer ID:', testCustomerId);

  // Verify Customer retrieval
  const getCustRes = await request('GET', `/api/v1/customers/id/${testCustomerId}`, null, {
    'X-Session-ID': platformSessionId,
  });
  console.log('Get Customer Status:', getCustRes.status);
  if (getCustRes.status !== 200 || getCustRes.body?.data?.id !== testCustomerId) {
    throw new Error('TEST 4 FAILED: Customer retrieval failed!');
  }
  console.log('>>> TEST 4 PASSED: Customer created and retrieved in PostgreSQL by Platform Super Admin.\n');

  // ----------------------------------------------------
  // 5. SUBSCRIPTION CONTROLLER PARAMETER FIX
  // ----------------------------------------------------
  console.log('--- TEST 5: Verify GET /api/v1/subscriptions parameter name contract ---');
  const subsRes = await request('GET', `/api/v1/subscriptions?customerId=${testCustomerId}`, null, {
    'X-Session-ID': platformSessionId,
  });
  console.log('Subscriptions Status:', subsRes.status);
  if (subsRes.status !== 200) {
    throw new Error('TEST 5 FAILED: Subscription controller parameter failed!');
  }
  console.log('>>> TEST 5 PASSED: Subscriptions endpoint returned 200 without reflection errors.\n');

  // ----------------------------------------------------
  // 6. TENANT QUERY AND CUSTOMER ASSOCIATION
  // ----------------------------------------------------
  console.log('--- TEST 6: Tenant Associated with Customer ---');
  testTenantId = '22222222-2222-2222-2222-222222222222';
  execSync(`docker exec -i nalentra-postgres psql -U nalentra_dev_user -d nalentra_dev -c "UPDATE tenant SET customer_id = '${testCustomerId}' WHERE id = '${testTenantId}';"`);

  const tenantRes = await request('GET', `/api/v1/tenants/${testTenantId}`, null, {
    'X-Session-ID': platformSessionId,
  });
  console.log('Get Tenant Status:', tenantRes.status);
  console.log('Get Tenant Body:', JSON.stringify(tenantRes.body, null, 2));

  if (tenantRes.status !== 200 || tenantRes.body?.data?.id !== testTenantId) {
    throw new Error('TEST 6 FAILED: Tenant query failed!');
  }
  console.log('>>> TEST 6 PASSED: Tenant verified and linked to Customer.\n');

  // ----------------------------------------------------
  // 7. TENANT ADMIN CREDENTIAL PREPARATION
  // ----------------------------------------------------
  console.log('--- TEST 7: Tenant Admin Credentials in PostgreSQL ---');
  const tenantAdminUsername = 'admin';
  tenantAdminIdentityId = '44444444-4444-4444-4444-444444444444';
  const bcryptHash = '$2a$10$3btQx5.kRn6guGXPrINjR.ND0nf3Wkr4VoEi59wa7zHGr7SOK1.6m'; // BCrypt for PlatformAdmin#2026!

  execSync(`docker exec -i nalentra-postgres psql -U nalentra_dev_user -d nalentra_dev -c "DELETE FROM identity_credential WHERE identity_id = '${tenantAdminIdentityId}';"`);
  execSync(`docker exec -i nalentra-postgres psql -U nalentra_dev_user -d nalentra_dev -c "INSERT INTO identity_credential (id, identity_id, credential_type, credential_hash, status, created_at, modified_at) VALUES (gen_random_uuid(), '${tenantAdminIdentityId}', 'PASSWORD', '${bcryptHash}', 'ACTIVE', NOW(), NOW());"`);
  console.log('>>> TEST 7 PASSED: Tenant Admin BCrypt credential configured in database.\n');

  // ----------------------------------------------------
  // 8. TENANT ADMIN AUTHENTICATION WITH TENANT CONTEXT
  // ----------------------------------------------------
  console.log('--- TEST 8: Tenant Admin Login WITH Tenant Context ---');
  const tenantLoginRes = await request('POST', '/api/v1/authentication/authenticate', {
    tenantId: testTenantId,
    username: tenantAdminUsername,
    credentialRaw: 'PlatformAdmin#2026!',
    credentialType: 'PASSWORD',
  });
  console.log('Tenant Login Status:', tenantLoginRes.status);
  console.log('Tenant Login Body:', JSON.stringify(tenantLoginRes.body, null, 2));

  if (tenantLoginRes.status !== 200 || !tenantLoginRes.body?.data?.sessionId) {
    throw new Error('TEST 8 FAILED: Tenant Admin login with tenant context failed!');
  }
  tenantSessionId = tenantLoginRes.body.data.sessionId;

  // Restore Tenant Admin Session
  const tenantSessionRes = await request('GET', '/api/v1/authentication/session', null, {
    'X-Session-ID': tenantSessionId,
  });
  console.log('Tenant Session Status:', tenantSessionRes.status);
  if (tenantSessionRes.status !== 200 || tenantSessionRes.body?.data?.status !== 'ACTIVE') {
    throw new Error('TEST 8 FAILED: Tenant Admin session restoration failed!');
  }

  // Verify Tenant Identity
  const tenantIdentRes = await request('GET', `/api/v1/identities/${tenantAdminIdentityId}`, null, {
    'X-Session-ID': tenantSessionId,
  });
  console.log('Tenant Identity Status:', tenantIdentRes.status);
  console.log('Tenant Identity tenantId:', tenantIdentRes.body?.data?.tenantId);
  if (tenantIdentRes.status !== 200 || tenantIdentRes.body?.data?.tenantId !== testTenantId) {
    throw new Error('TEST 8 FAILED: Tenant Admin identity does not match tenantId!');
  }

  // Verify Tenant Authorization Roles
  const tenantRolesRes = await request('GET', `/api/v1/authorization/identities/${tenantAdminIdentityId}/roles`, null, {
    'X-Session-ID': tenantSessionId,
  });
  console.log('Tenant Roles Status:', tenantRolesRes.status);
  console.log('Tenant Roles:', JSON.stringify(tenantRolesRes.body?.data, null, 2));
  const tRoles = tenantRolesRes.body?.data || [];
  if (!tRoles.some(r => r.code === 'TENANT_ADMIN')) {
    throw new Error('TEST 8 FAILED: TENANT_ADMIN role not found on tenant admin identity!');
  }
  console.log('>>> TEST 8 PASSED: Tenant Admin logged in WITH tenant context and resolved TENANT_ADMIN role.\n');

  // ----------------------------------------------------
  // 9. WORKSPACE CREATION & RETRIEVAL WITH REAL BACKEND
  // ----------------------------------------------------
  console.log('--- TEST 9: Workspace Lifecycle on PostgreSQL (by Tenant Admin) ---');
  const wspCode = 'wsp-' + Date.now().toString().slice(-6);
  const wspRes = await request('POST', `/api/v1/tenants/${testTenantId}/workspaces`, {
    workspaceCode: wspCode,
    workspaceName: 'Workspace ' + wspCode,
    description: 'Product-neutral business workspace',
    status: 'ACTIVE',
    workspaceType: 'OPERATIONAL',
  }, {
    'X-Session-ID': tenantSessionId,
  });
  console.log('Create Workspace Status:', wspRes.status);
  console.log('Create Workspace Body:', JSON.stringify(wspRes.body, null, 2));

  if (wspRes.status !== 201 && wspRes.status !== 200) {
    throw new Error('TEST 9 FAILED: Workspace creation failed!');
  }
  createdWorkspaceId = wspRes.body.data.id;

  // Retrieve Workspace
  const getWspRes = await request('GET', `/api/v1/tenants/${testTenantId}/workspaces/${createdWorkspaceId}`, null, {
    'X-Session-ID': tenantSessionId,
  });
  console.log('Get Workspace Status:', getWspRes.status);
  console.log('Get Workspace Body:', JSON.stringify(getWspRes.body, null, 2));

  if (getWspRes.status !== 200 || getWspRes.body?.data?.id !== createdWorkspaceId) {
    throw new Error('TEST 9 FAILED: Could not retrieve created workspace!');
  }

  // Cross-tenant negative test: Accessing workspace from different tenantId
  console.log('Negative Test 9.1: Accessing workspace with mismatched tenant ID...');
  const fakeTenantId = '00000000-0000-0000-0000-000000000000';
  const crossTenantRes = await request('GET', `/api/v1/tenants/${fakeTenantId}/workspaces/${createdWorkspaceId}`, null, {
    'X-Session-ID': tenantSessionId,
  });
  console.log('Cross-tenant Access Status:', crossTenantRes.status);
  if (crossTenantRes.status === 200 && crossTenantRes.body?.data?.id === createdWorkspaceId) {
    throw new Error('SECURITY VIOLATION: Cross-tenant isolation failed! Workspace returned under wrong tenantId.');
  }
  console.log('>>> PASS: Cross-tenant access blocked or not found under incorrect tenantId.\n');

  // ----------------------------------------------------
  // 10. SECURITY NEGATIVE TESTS
  // ----------------------------------------------------
  console.log('--- TEST 10: Additional Security Negative Tests ---');

  // NEGATIVE TEST 10.1: Tenant Admin CANNOT authenticate as Platform Super Admin (omitting tenantId)
  console.log('Negative Test 10.1: Authenticating tenant admin without tenantId...');
  const negLoginRes = await request('POST', '/api/v1/authentication/authenticate', {
    username: tenantAdminUsername,
    credentialRaw: 'PlatformAdmin#2026!',
    credentialType: 'PASSWORD',
  });
  console.log('Negative Login (without tenantId) Status:', negLoginRes.status);
  if (negLoginRes.status === 200) {
    throw new Error('SECURITY VIOLATION: Tenant Admin authenticated as Platform Super Admin by omitting tenantId!');
  }
  console.log('>>> PASS: Tenant Admin was rejected when attempting platform login without tenantId.\n');

  // NEGATIVE TEST 10.2: Platform Super Admin CANNOT authenticate against a specific tenant
  console.log('Negative Test 10.2: Authenticating Platform Super Admin with a specific tenantId...');
  const negPlatformTenantRes = await request('POST', '/api/v1/authentication/authenticate', {
    tenantId: testTenantId,
    username: 'superadmin',
    credentialRaw: 'PlatformAdmin#2026!',
    credentialType: 'PASSWORD',
  });
  console.log('Negative Platform Login (with tenantId) Status:', negPlatformTenantRes.status);
  if (negPlatformTenantRes.status === 200) {
    throw new Error('SECURITY VIOLATION: Platform Super Admin authenticated as Tenant Admin!');
  }
  console.log('>>> PASS: Platform Super Admin rejected when attempting tenant-bound login.\n');

  // NEGATIVE TEST 10.3: Unauthenticated access to /session
  console.log('Negative Test 10.3: Accessing /session without credentials...');
  const negUnauthSessionRes = await request('GET', '/api/v1/authentication/session');
  console.log('Unauthenticated /session Status:', negUnauthSessionRes.status);
  if (negUnauthSessionRes.status !== 401) {
    throw new Error('SECURITY VIOLATION: Unauthenticated /session did not return 401!');
  }
  console.log('>>> PASS: Unauthenticated /session rejected with 401.\n');

  // NEGATIVE TEST 10.4: Logout invalidates session
  console.log('Negative Test 10.4: Testing logout and session revocation...');
  const logoutRes = await request('POST', '/api/v1/authentication/logout', null, {
    'X-Session-ID': platformSessionId,
  });
  console.log('Logout Status:', logoutRes.status);

  const postLogoutSessionRes = await request('GET', '/api/v1/authentication/session', null, {
    'X-Session-ID': platformSessionId,
  });
  console.log('Post-logout /session Status:', postLogoutSessionRes.status);
  if (postLogoutSessionRes.status !== 401) {
    throw new Error('SECURITY VIOLATION: Revoked session was still accepted!');
  }
  console.log('>>> PASS: Logged-out session cannot access protected APIs (returned 401).\n');

  console.log('====================================================');
  console.log('ALL E2E AND SECURITY TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('\n*** TEST SUITE RUN FAILED ***\n', err);
  process.exit(1);
});
