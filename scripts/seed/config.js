const SEED_PREFIX = 'seed_';
const ALLOWED_ENVS = ['localhost', 'development', 'staging', 'test'];

function parseArgs(argv) {
  const args = {
    dryRun: false,
    clearSeed: false,
    withAuth: false,
    allowProduction: false,
    confirmProduction: '',
    useEmulator: false,
    emulatorHost: process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--clear-seed') args.clearSeed = true;
    else if (arg === '--with-auth') args.withAuth = true;
    else if (arg === '--allow-production') args.allowProduction = true;
    else if (arg === '--use-emulator') args.useEmulator = true;
    else if (arg.startsWith('--emulator-host=')) {
      args.useEmulator = true;
      args.emulatorHost = arg.split('=')[1];
    }
    else if (arg.startsWith('--confirm-production=')) {
      args.confirmProduction = arg.split('=')[1];
    }
  }

  return args;
}

function resolveEnv() {
  return process.env.NODE_ENV || 'staging';
}

function assertEnvAllowed(args) {
  const env = resolveEnv();

  if (env === 'production') {
    if (!args.allowProduction) {
      throw new Error(
        'Refusing to seed production. Pass --allow-production --confirm-production=I-UNDERSTAND',
      );
    }
    if (args.confirmProduction !== 'I-UNDERSTAND') {
      throw new Error(
        'Production seed requires --confirm-production=I-UNDERSTAND',
      );
    }
    return env;
  }

  if (!ALLOWED_ENVS.includes(env)) {
    throw new Error(
      `Unsupported NODE_ENV="${env}". Allowed: ${ALLOWED_ENVS.join(', ')}`,
    );
  }

  return env;
}

module.exports = {
  SEED_PREFIX,
  ALLOWED_ENVS,
  parseArgs,
  resolveEnv,
  assertEnvAllowed,
};
