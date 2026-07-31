# 몰디브 바이블 분석 이벤트

사이트는 운영 도메인에서만 GA4와 Clarity를 로드하며, GA4 페이지뷰는 첫 진입과 SPA 화면 이동마다 한 번씩 전송합니다.

## 퍼널

1. `page_view`: 랜딩·SPA 화면 조회
2. `resort_filter_apply` / `view_search_results`: 조건 탐색
3. `resort_detail_view`: 리조트 상세 확인
4. `resort_compare_item_add`: 비교 후보 추가
5. `resort_compare_start`: 실제 비교 시작
6. `quote_comparison_reached`: 견적 비교 화면 도달
7. `quote_template_copy`: 동일 조건 견적 요청문 복사
8. `agency_outbound_click`: 여행사 홈페이지·카카오 이동

리조트 검색창은 자유 입력값을 받을 수 있으므로 원문을 분석 도구로 보내지 않습니다. `view_search_results`에는 검색어 길이, 결과 존재 여부와 결과 수만 전송해 이메일·전화번호 같은 개인정보가 우연히 수집되는 일을 막습니다.

## GA4 핵심 이벤트 권장값

- 주 전환: `agency_outbound_click`
- 보조 전환: `quote_template_copy`, `resort_compare_start`
- 관찰 이벤트: `quote_comparison_reached`, `resort_detail_view`, `resort_filter_apply`

코드 배포 후 이벤트가 GA4 실시간 보고서에 들어오는 것을 확인한 다음 관리 화면에서 주·보조 전환 세 개를 핵심 이벤트로 지정합니다. 내부 개발 접속과 Vercel 미리보기에서는 이벤트가 전송되지 않습니다.

## 일자별 보고 항목

`session source / medium → session campaign → landing page → engaged sessions → resort_compare_start → quote_template_copy → agency_outbound_click` 순서로 봅니다. 표본이 적은 날은 비율만 비교하지 말고 이벤트 사용자 수와 원시 건수를 함께 기록합니다.
