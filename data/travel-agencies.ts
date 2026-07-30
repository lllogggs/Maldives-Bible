export type AgencyChannel = 'website' | 'kakao';

export interface TravelAgency {
  id: string;
  name: string;
  website: string | null;
  kakao_channel: string | null;
}

export const TRAVEL_AGENCIES: readonly TravelAgency[] = [
  { id: 'tourmin', name: '투어민', website: 'https://www.tourmin.co.kr', kakao_channel: 'https://pf.kakao.com/_LxbYBM' },
  { id: 'pureun-travel-club', name: '푸른여행클럽', website: 'https://cafe.naver.com/honeymoonp', kakao_channel: 'https://pf.kakao.com/_UZNxgd' },
  { id: 'real-maldives', name: '리얼몰디브', website: 'https://realmaldives.co.kr', kakao_channel: 'https://pf.kakao.com/_NcnxaG' },
  { id: 'trevia', name: '트레비아', website: 'https://www.trevia.co.kr', kakao_channel: 'https://pf.kakao.com/_xixjNQl' },
  { id: 'nadree', name: '나래여행사', website: 'http://www.nadree.net/', kakao_channel: null },
  { id: 'hi-maldives', name: '하이몰디브', website: 'https://www.himaldives.co.kr/', kakao_channel: null },
  { id: 'travel-walk', name: '여행산책', website: 'https://www.tourw.co.kr/', kakao_channel: null },
  { id: 'its-my-travel', name: '잇츠마이트래블', website: 'http://itsmytravel.co.kr/', kakao_channel: 'https://pf.kakao.com/_qgDUxd' },
  { id: 'tour-planet', name: '투어플래닛', website: 'http://www.tour-planet.co.kr/', kakao_channel: 'https://pf.kakao.com/_LYSSl' },
  { id: 'honeymoon-resort', name: '허니문리조트', website: 'http://www.honeymoonresort.co.kr/', kakao_channel: 'https://pf.kakao.com/_gkKlE' },
  { id: '1000syb', name: '천생연분닷컴', website: 'https://www.1000syb.com/', kakao_channel: null },
  { id: 'palm-tour', name: '팜투어', website: 'https://www.palmtour.co.kr', kakao_channel: 'https://pf.kakao.com/_Hxmxaxexj' },
] as const;

export const getAgencyChannelUrl = (agency: TravelAgency, channel: AgencyChannel) =>
  channel === 'website' ? agency.website : agency.kakao_channel;
