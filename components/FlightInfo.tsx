import React from 'react';
import { ClockIcon, CalendarIcon } from './icons/Icons';

const FlightInfo: React.FC = () => {
  return (
    <div className="space-y-16 animate-fade-in pb-10">
      {/* Header Section */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">항공권 정보</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          말레행 인기 경유 노선과 평균 요금, 스탑오버 포인트를 빠르게 확인하세요.
        </p>
      </section>

      {/* Overview Table */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-700 whitespace-nowrap">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 font-bold">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">경유지</th>
                <th scope="col" className="px-6 py-4 text-left">항공사</th>
                <th scope="col" className="px-6 py-4 text-left">예상 왕복요금</th>
                <th scope="col" className="px-6 py-4 text-left">소요시간</th>
                <th scope="col" className="px-6 py-4 text-left">특징</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">싱가포르</td>
                <td className="px-6 py-4">싱가포르항공, 스쿠트</td>
                <td className="px-6 py-4 text-cyan-600 font-bold">₩120만 ~</td>
                <td className="px-6 py-4">11~13시간</td>
                <td className="px-6 py-4 text-gray-500">창이 공항 무료 투어</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">두바이</td>
                <td className="px-6 py-4">에미레이트항공</td>
                <td className="px-6 py-4 text-cyan-600 font-bold">₩130만 ~</td>
                <td className="px-6 py-4">13~15시간</td>
                <td className="px-6 py-4 text-gray-500">A380, 럭셔리 스탑오버</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">아부다비</td>
                <td className="px-6 py-4">에티하드항공</td>
                <td className="px-6 py-4 text-cyan-600 font-bold">₩125만 ~</td>
                <td className="px-6 py-4">13~15시간</td>
                <td className="px-6 py-4 text-gray-500">무료 호텔 프로모션</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">말레이시아</td>
                <td className="px-6 py-4">말레이시아항공, 에어아시아</td>
                <td className="px-6 py-4 text-cyan-600 font-bold">₩100만 ~</td>
                <td className="px-6 py-4">12~14시간</td>
                <td className="px-6 py-4 text-gray-500">가성비, 동남아 연계</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Flight Schedules Visualized */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">주요 항공편 스케줄</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Singapore Airlines */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">싱가포르항공</h3>
                <p className="text-xs text-gray-500 mt-1">SQ607 / SQ432</p>
              </div>
              <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded">인기</span>
            </div>

            <div className="relative flex justify-between items-center text-center mb-6">
              {/* Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>

              <div className="bg-white px-2">
                <div className="font-bold text-gray-900 text-lg">09:10</div>
                <div className="text-xs text-gray-500">ICN</div>
              </div>
              <div className="bg-white px-2">
                <div className="text-xs text-gray-400 mb-1">5h 15m 대기</div>
                <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto"></div>
                <div className="text-xs text-gray-500 mt-1">SIN</div>
              </div>
              <div className="bg-white px-2">
                <div className="font-bold text-gray-900 text-lg">22:05</div>
                <div className="text-xs text-gray-500">MLE</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              <div className="flex gap-2 items-start">
                <ClockIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-600">총 소요시간 약 16시간</span>
              </div>
              <div className="flex gap-2 items-start">
                <CalendarIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-600">최대 48시간 스탑오버 패키지 가능</span>
              </div>
            </div>
          </div>

          {/* Emirates */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">에미레이트항공</h3>
                <p className="text-xs text-gray-500 mt-1">EK323 / EK656</p>
              </div>
            </div>

            <div className="relative flex justify-between items-center text-center mb-6">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>

              <div className="bg-white px-2">
                <div className="font-bold text-gray-900 text-lg">23:55</div>
                <div className="text-xs text-gray-500">ICN</div>
              </div>
              <div className="bg-white px-2">
                <div className="text-xs text-gray-400 mb-1">5h 50m 대기</div>
                <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto"></div>
                <div className="text-xs text-gray-500 mt-1">DXB</div>
              </div>
              <div className="bg-white px-2">
                <div className="font-bold text-gray-900 text-lg">16:05</div>
                <div className="text-xs text-gray-500">MLE</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              <div className="flex gap-2 items-start">
                <ClockIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-600">총 소요시간 약 20시간 (야간 출발)</span>
              </div>
              <div className="flex gap-2 items-start">
                <CalendarIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-600">두바이 커넥트 서비스 (호텔 제공)</span>
              </div>
            </div>
          </div>

          {/* Etihad */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">에티하드항공</h3>
                <p className="text-xs text-gray-500 mt-1">EY873 / EY278</p>
              </div>
            </div>

            <div className="relative flex justify-between items-center text-center mb-6">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>

              <div className="bg-white px-2">
                <div className="font-bold text-gray-900 text-lg">00:25</div>
                <div className="text-xs text-gray-500">ICN</div>
              </div>
              <div className="bg-white px-2">
                <div className="text-xs text-gray-400 mb-1">4h 05m 대기</div>
                <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto"></div>
                <div className="text-xs text-gray-500 mt-1">AUH</div>
              </div>
              <div className="bg-white px-2">
                <div className="font-bold text-gray-900 text-lg">15:15</div>
                <div className="text-xs text-gray-500">MLE</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              <div className="flex gap-2 items-start">
                <ClockIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-600">총 소요시간 약 19시간</span>
              </div>
              <div className="flex gap-2 items-start">
                <CalendarIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-600">최대 2박 무료 스탑오버 호텔</span>
              </div>
            </div>
          </div>

          {/* Scoot */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">스쿠트 (LCC)</h3>
                <p className="text-xs text-gray-500 mt-1">TR841 / TR588</p>
              </div>
              <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-xs font-bold rounded">가성비</span>
            </div>

            <div className="relative flex justify-between items-center text-center mb-6">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>

              <div className="bg-white px-2">
                <div className="font-bold text-gray-900 text-lg">18:20</div>
                <div className="text-xs text-gray-500">ICN</div>
              </div>
              <div className="bg-white px-2">
                <div className="text-xs text-gray-400 mb-1">2h 10m 대기</div>
                <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto"></div>
                <div className="text-xs text-gray-500 mt-1">SIN</div>
              </div>
              <div className="bg-white px-2">
                <div className="font-bold text-gray-900 text-lg">03:15</div>
                <div className="text-xs text-gray-500">MLE</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              <div className="flex gap-2 items-start">
                <ClockIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-600">총 소요시간 약 12시간 (새벽 도착)</span>
              </div>
              <div className="flex gap-2 items-start">
                <CalendarIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-600">수하물/기내식 별도 구매 필요</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stopover Tips */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">경유지별 장단점</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              city: '싱가포르',
              pros: ['창이 공항의 압도적인 시설 (쥬얼 창이)', '쇼핑/미식 투어 용이', '치안이 좋고 깨끗함'],
              cons: ['성수기 좌석 확보 어려움', '호텔 비용이 비싼 편']
            },
            {
              city: '두바이',
              pros: ['사막 사파리 등 이색 투어', '압도적인 스케일의 쇼핑몰', '럭셔리 호텔 경험'],
              cons: ['여름철 극심한 더위', '이동 동선이 김']
            }
          ].map((item) => (
            <div key={item.city} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{item.city} 경유</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded mb-2 inline-block">장점</span>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {item.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded mb-2 inline-block">단점</span>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {item.cons.map((con, i) => <li key={i}>{con}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FlightInfo;
