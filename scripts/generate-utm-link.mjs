#!/usr/bin/env node

const BASE_SITE_URL = 'https://www.maldivesbible.com/';
const BASE_URL = new URL(BASE_SITE_URL);
const VALUE_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const REQUIRED_FIELDS = ['source', 'medium', 'campaign'];
const OPTIONAL_FIELDS = ['content', 'term'];
const VALUE_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
const SUPPORTED_OPTIONS = new Set(['path', ...VALUE_FIELDS]);
const ALLOWED_MEDIA = new Set(['social', 'referral', 'email', 'cpc', 'paid_social']);

const HELP = `몰디브 바이블 외부 홍보용 UTM 링크 생성기

Usage:
  npm run utm:generate -- --source <value> --medium <value> --campaign <value> [options]

Required:
  --source <value>      배포 플랫폼 (예: threads, naver_blog, facebook)
  --medium <value>      유입 유형 (social, referral, email, cpc, paid_social)
  --campaign <value>    캠페인명 (예: 2026_08_resort_compare)

Options:
  --path <path-or-url>  사이트 내 목적지 (기본값: /)
  --content <value>     소재·배치·버전
  --term <value>        유료 키워드·타깃
  --help                도움말 표시

Values:
  source, medium, campaign, content, term은 소문자 snake_case만 허용합니다.
  생성한 URL은 외부 홍보 지면에만 사용하고 사이트 내부 링크에는 사용하지 마세요.

Base URL:
  ${BASE_SITE_URL}`;

function parseArguments(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help') {
      options.help = true;
      continue;
    }

    if (!argument.startsWith('--')) {
      throw new Error(`위치 인수는 지원하지 않습니다: ${argument}`);
    }

    const separatorIndex = argument.indexOf('=');
    const name = argument.slice(2, separatorIndex === -1 ? undefined : separatorIndex);
    let value = separatorIndex === -1 ? undefined : argument.slice(separatorIndex + 1);

    if (!SUPPORTED_OPTIONS.has(name)) {
      throw new Error(`지원하지 않는 옵션입니다: --${name}`);
    }

    if (Object.hasOwn(options, name)) {
      throw new Error(`옵션을 한 번만 지정하세요: --${name}`);
    }

    if (value === undefined) {
      const nextArgument = argv[index + 1];
      if (nextArgument === undefined || nextArgument.startsWith('--')) {
        throw new Error(`값이 필요합니다: --${name}`);
      }
      value = nextArgument;
      index += 1;
    }

    if (value.length === 0) {
      throw new Error(`빈 값은 허용하지 않습니다: --${name}`);
    }

    options[name] = value;
  }

  return options;
}

function validateTrackingValues(options) {
  for (const field of REQUIRED_FIELDS) {
    if (!options[field]) {
      throw new Error(`필수 옵션이 누락되었습니다: --${field}`);
    }
  }

  for (const field of VALUE_FIELDS) {
    const value = options[field];
    if (value !== undefined && !VALUE_PATTERN.test(value)) {
      throw new Error(
        `--${field} 값은 소문자 snake_case여야 합니다: ${value}`,
      );
    }
  }

  if (!ALLOWED_MEDIA.has(options.medium)) {
    throw new Error(
      `--medium은 GA4 채널 분류용 통제값만 허용합니다: ${[...ALLOWED_MEDIA].join(', ')}`,
    );
  }
}

function resolveTargetUrl(path = '/') {
  let targetUrl;

  try {
    targetUrl = new URL(path, BASE_URL);
  } catch {
    throw new Error(`유효한 사이트 경로 또는 URL이 아닙니다: ${path}`);
  }

  if (targetUrl.origin !== BASE_URL.origin) {
    throw new Error(`몰디브 바이블 도메인만 사용할 수 있습니다: ${BASE_SITE_URL}`);
  }

  const existingUtmParameter = [...targetUrl.searchParams.keys()].find((key) =>
    key.toLowerCase().startsWith('utm_'),
  );

  if (existingUtmParameter) {
    throw new Error(`목적지에 기존 UTM 파라미터가 있습니다: ${existingUtmParameter}`);
  }

  return targetUrl;
}

function generateUtmLink(options) {
  validateTrackingValues(options);
  const targetUrl = resolveTargetUrl(options.path);

  for (const field of VALUE_FIELDS) {
    if (options[field] !== undefined) {
      targetUrl.searchParams.set(`utm_${field}`, options[field]);
    }
  }

  return targetUrl.toString();
}

try {
  const options = parseArguments(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(`${HELP}\n`);
  } else {
    process.stdout.write(`${generateUtmLink(options)}\n`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[utm] ${message}\n`);
  process.stderr.write('[utm] 사용법은 --help로 확인하세요.\n');
  process.exitCode = 1;
}
