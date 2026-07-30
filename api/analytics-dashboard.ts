import type { ApiRequest, ApiResponse } from '../server/api-http';
import {
  isAnalyticsAdminAuthenticated,
  setPrivateAnalyticsHeaders,
} from '../server/analytics-admin-auth.js';
import {
  getAnalyticsDashboard,
  getGa4ConfigurationStatus,
  isAnalyticsRangeDays,
} from '../server/ga4-analytics.js';

const send = (res: ApiResponse, status: number, body: unknown) =>
  res.status(status).json(body);

const firstQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getSafeError = (error: unknown) => {
  const candidate = error as { code?: number | string; message?: string };
  const message = candidate?.message ?? '';

  if (candidate?.code === 7 || /permission|forbidden|access denied/i.test(message)) {
    return {
      error: 'ga4_property_access_denied',
      message: '서비스 계정에 해당 GA4 속성의 뷰어 권한을 부여해 주세요.',
    };
  }
  if (candidate?.code === 16 || /credential|unauthenticated|invalid_grant/i.test(message)) {
    return {
      error: 'ga4_credentials_invalid',
      message: 'GA4 서비스 계정 인증 정보를 확인해 주세요.',
    };
  }
  if (candidate?.code === 8 || /quota|rate limit|resource exhausted/i.test(message)) {
    return {
      error: 'ga4_rate_limited',
      message: 'GA4 조회 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.',
    };
  }
  if (/dimension|metric|incompatible|invalid argument/i.test(message)) {
    return {
      error: 'ga4_report_incompatible',
      message: 'GA4 보고서 설정을 확인해야 합니다. 서버 로그의 상세 오류를 확인해 주세요.',
    };
  }
  return {
    error: 'analytics_unavailable',
    message: '분석 데이터를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  };
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setPrivateAnalyticsHeaders(res);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { error: 'method_not_allowed', message: 'GET 요청만 지원합니다.' });
  }

  if (!isAnalyticsAdminAuthenticated(req)) {
    return send(res, 401, { error: 'unauthorized', message: '관리자 로그인이 필요합니다.' });
  }

  const configuration = getGa4ConfigurationStatus();
  if (!configuration.configured) {
    return send(res, 503, {
      error: 'analytics_not_configured',
      message: 'GA4 Data API 연결 설정이 필요합니다.',
      setup: configuration.missing,
    });
  }

  const days = Number(firstQueryValue(req.query.range) ?? 28);
  if (!isAnalyticsRangeDays(days)) {
    return send(res, 400, {
      error: 'invalid_range',
      message: '조회 기간은 7일, 28일, 90일 중 하나여야 합니다.',
    });
  }

  const forceRefresh = firstQueryValue(req.query.refresh) === '1';
  try {
    const data = await getAnalyticsDashboard(days, forceRefresh);
    return send(res, 200, data);
  } catch (error) {
    console.error('GA4 analytics dashboard request failed', error);
    const safeError = getSafeError(error);
    return send(res, 503, safeError);
  }
}
