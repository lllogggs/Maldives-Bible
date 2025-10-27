// scripts/clean-resort-images.js
import fs from "fs";
import path from "path";

// === 제외할 이미지 URL 목록 ===
const EXCLUDED_URLS = new Set([
  "https://www.adaaran.com/selecthudhuranfushi/wp-content/themes/adaaran-theme/assets/img/bg.png",
  "https://adaaran.imgix.net/sites/4/2025/08/select-hudaranfushi.png",
  "https://www.adaaran.com/selecthudhuranfushi/wp-content/themes/adaaran-theme/assets/img/close-b.png",
  "https://adaaran.imgix.net/sites/4/2025/08/vadhoo-footer-icon-1.png",
  "https://www.adaaran.com/selecthudhuranfushi/wp-content/themes/adaaran-theme/assets/img/placeholder.jpg",
  "https://adaaran.imgix.net/sites/5/2025/08/select-hudaranfushi.png",
  "https://www.adaaran.com/selectmeedhupparu/wp-content/themes/adaaran-theme/assets/img/bg.png",
  "https://www.adaaran.com/selectmeedhupparu/wp-content/themes/adaaran-theme/assets/img/placeholder.jpg",
  "https://www.adaaran.com/selectmeedhupparu/wp-content/themes/adaaran-theme/assets/img/close-b.png",
  "https://adaaran.imgix.net/sites/5/2025/08/selectmeedhupparu-2.png",
  "https://adaaran.imgix.net/sites/5/2025/08/selectmeedhupparu-footer-1.png",
  "https://adaaran.imgix.net/sites/5/2025/08/vadhoo-footer-icon-1.png",
  "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/10/04/0657/MLDAL-P0057-Water-Villa-Bedroom.jpg/MLDAL-P0057-Water-Villa-Bedroom.16x9.jpg",
  "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/10/14/0517/MLDAL-P0146-Beach-Villa-Pathway.jpg/MLDAL-P0146-Beach-Villa-Pathway.16x9.jpg",
  "https://www.alimatha.nakairesorts.com/data/2560/-DSC5911----Nakai-Resort-Maldive-alimatha-Over-Water.jpg",
  "https://www.alimatha.nakairesorts.com/data/2560/-DSC4787----Nakai-Resort-Maldive-alimatha-Over-Water.jpg",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/04_tivoli_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/mh_logo_c_2024.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/03_the_wolseley_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/08_avani_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/anantara/images/brandpage/homepage/gha_discovery_new_logo_143x24.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/09_colbert_collection_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto,c_limit,w_1920/media/minor/anantara/images/anantara-kihavah-maldives-villas/gallery/leisure/anantara_kihavah_private_ocean_journeys_1920x1037.jpg",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/11_oaks_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/01_anantara_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/10_nh_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/12_istay_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/07_nhow_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto,c_limit,w_1920/media/minor/anantara/images/anantara-kihavah-maldives-villas/gallery/leisure/anantara_kihavah_house_reef_snorklling_1920x1037.jpg",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/06_nh_collection_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/anantara/images/anantara-kihavah-maldives-villas/logos/property-logo/anantara_kihavah_maldives_villas_2024_360x140.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/02_elewana_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/05_mrc_100_c.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/04_tivoli_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/mh_logo_c_2024.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/03_the_wolseley_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/08_avani_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/anantara/images/anantara-veli-maldives-resort/logos/property-logo/anantara_veli_maldives_resort_logo_2024_360x140.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/anantara/images/brandpage/homepage/gha_discovery_new_logo_143x24.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/09_colbert_collection_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/11_oaks_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/01_anantara_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/10_nh_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/12_istay_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/07_nhow_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/06_nh_collection_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/02_elewana_100.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/05_mrc_100_c.png",
  "https://assets.anantara.com/image/upload/q_auto,f_auto,c_limit,w_1920/media/minor/anantara/images/anantara-veli-maldives-resort/gallery/leisure/anantara_veli_maldives_resort_beach_couple_walking_1920x1037.jpg",
  "https://assets.anantara.com/image/upload/q_auto,f_auto,c_limit,w_1920/media/minor/anantara/images/anantara-veli-maldives-resort/gallery/dining/anantara_veli_maldives_resort_restaurant_dining_by_design_beach_couple_1920x1037.jpg",
  "https://angaga.com.mv/wp-content/uploads/2018/10/experiences-excursion.jpg",
  "https://angaga.com.mv/wp-content/uploads/2018/10/experiences-diving.jpg",
  "https://angaga.com.mv/wp-content/uploads/2019/01/Angaga-Logo-1.png",
  "https://angaga.com.mv/wp-content/uploads/2018/10/experiences-spa.jpg",
  "https://angaga.com.mv/wp-content/uploads/2018/10/experiences-water-sports.jpg",
  "https://www.angsana.com/assets/2022-04/an-velavaru-gallery-palm-tree-lady.jpg",
  "https://www.angsana.com/assets/icons/Angsana-Logoblack.png",
  "https://www.angsana.com/assets/2022-04/an-velavaru-gallery-birds.jpg",
  "https://www.angsana.com/assets/2025-01/woman%20hat.jpg",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_1893d4a8d727-c2c2-4bc6-b3d6-1ba74ea3aabfblob.png&w=3840&q=75",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_190145881d16-4d98-460e-b4ed-634bf00895b9blob.png&w=3840&q=75",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_964e6129791-a05e-4f49-8c47-1029c9278385blob.png&w=750&q=100",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_19117c18d963-be31-45a5-95dd-6d300fb05be2blob.jpg&w=64&q=75",
  "https://ahr-ucmsapi.atmospherehotelsandresorts.com/AHR/images/subSection_1902352e338a-93c3-4243-933f-fbd27bf44de2blob.png",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2Fsection_6118d53733-f84c-41f2-ae63-2aa83ab83279blob.jpg&w=128&q=100",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_1902352e338a-93c3-4243-933f-fbd27bf44de2blob.png&w=3840&q=75",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_18867959001f-d527-488d-b68f-fc72a82c1ad8blob.png&w=3840&q=75",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_18902f82e24f-7727-482f-bea7-572d5521754fblob.jpg&w=64&q=75",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_19044982a23c-49f2-4c28-b805-d46e3905e905blob.jpg&w=64&q=75",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_1883acbc863a-0d13-4df0-b675-7755e8d4897bblob.jpg&w=64&q=75",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_190385404fa3-d091-4045-a72c-db70717a1dd7blob.png&w=3840&q=75",
  "https://atmosphere-kanifushi.com/_next/image?url=https%3A%2F%2Fahr-ucmsapi.atmospherehotelsandresorts.com%2FAHR%2Fimages%2FsubSection_1897ef0f21fd-0fbe-4ace-a4e2-661bd572b7b9blob.jpg&w=64&q=75",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/avani/best-rate-plum-mobile.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/04_tivoli_100.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/12_istay_100.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/05_mrc_100_c.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/10_nh_100.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/07_nhow_100.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/avani/best-rate.png?h=16&w=162&la=en",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/09_colbert_collection_100.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/avani/images/fares-maldives/overview/avani_plus_fares_maldives_logo_white_238x126.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/08_avani_100.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/11_oaks_100.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/mh_logo_c_2024.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/01_anantara_100.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/02_elewana_100.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/06_nh_collection_100.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/avani/images/brand/homepage/gha_discovery_new_logo_179x30.png",
  "https://assets.avanihotels.com/image/upload/q_auto,f_auto/media/minor/brand-footer-logos/2025/color/03_the_wolseley_100.png",
  "https://bandosmaldives.com/wp-content/uploads/2024/02/BM_Dive-award-1920x1080-2-700x450.jpg",
  "https://bandosmaldives.com/wp-content/uploads/2024/06/BM_Bandos-press-1-700x450.jpg",
  "https://bandosmaldives.com/wp-content/uploads/2021/06/BM_Football-1920x1080-1-700x450.jpg",
  "https://bandosmaldives.com/wp-content/uploads/2024/08/BM_TTM-Award-700x450.jpg",
  "https://bandosmaldives.com/wp-content/uploads/2024/04/lgw-2.png",
  "https://bandosmaldives.com/wp-content/uploads/2024/09/BM_SATA-Awards-1-700x450.jpg",
  "https://bandosmaldives.com/wp-content/uploads/2024/04/cropped-lg512-2.png",
  "https://bandosmaldives.com/wp-content/uploads/2024/11/BM-Festive-01-3-700x450.jpg",
  "https://bandosmaldives.com/wp-content/uploads/2025/10/Kate-and-Andy-700x450.jpg",
  "https://bandosmaldives.com/wp-content/uploads/2024/02/BM_Floating-breakfast-700x450.jpeg",
  "https://bandosmaldives.com/wp-content/uploads/2024/09/BM_FB-team-1-700x450.jpg",
  "https://bandosmaldives.com/wp-content/uploads/2024/06/BM_Hotel-Asia-Bandos-team-1920x1080-1-700x450.jpg",
  "https://bandosmaldives.com/wp-content/uploads/2023/08/lgw-Copy.png",
  "https://bandosmaldives.com/wp-content/uploads/2025/10/Hotel-Asia-Culinaary-700x450.png",
  "https://www.banyantree.com/assets/2021-11/bt-vabbinfaru-experiences-sunsetcruise.png",
  "https://www.banyantree.com/assets/2025-02/bt-vabbinfaru-villa-interior.png",
  "https://static.barcelo.com/content/dam/barcelo/commons/icons/ui/promocode_check.png",
  "https://adaaran.imgix.net/sites/3/2025/08/vadhoo-footer-icon-2.png",
  "https://www.adaaran.com/prestigevadoo/wp-content/themes/adaaran-theme/assets/img/placeholder.jpg",
  "https://www.adaaran.com/prestigevadoo/wp-content/themes/adaaran-theme/assets/img/bg.png",
  "https://adaaran.imgix.net/sites/3/2025/08/vadhoo-footer-icon-1.png",
  "https://www.adaaran.com/prestigevadoo/wp-content/themes/adaaran-theme/assets/img/close-b.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67ea3d57c10aa.jpg/1920x1080/resize/80/ed682560188ec81020f5b69015aaf8b8.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66823f031f063.jpg/432x220/fit;c:0,515,4640,2878/80/d03bc2ff8fb1ae910ce6f94e3f66509e.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6668a8780f181.jpg/432x220/fit/80/fc3c843ae110eb3847adcd35346f194f.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67ea3d57c10aa.jpg/432x220/fit/80/5c4f89baa455be20f76f130e29a43bde.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/667e1ec8c5e54.png/432x220/fit/80/61644a84d8f4a20beff52c114815ed9a.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/667e9f686ff3a.jpg/432x220/fit/80/cd154b9a779799ca54685c243dc9b9e6.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6655a75922252.jpg/392x392/fit/80/743963f742eb88581cd04e519b21a62c.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c5c0cfe11.jpg/392x392/fit/80/eff7e005fc24dc2d06f3abf30677ec19.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/669a1043aa5d1.jpg/1920x1080/resize/80/61d2409d50528d92db3195bbbd96b030.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66babf1876bda.jpg/432x220/fit/80/ac34e4879fc5c29d47e51d3632a70599.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67ea404e2c767.jpg/1920x1080/resize/80/9d9b674f6d09f3727ab2a8591c0be3f2.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cc060f89dd1.jpg/1920x1080/resize;c:0,2272,3648,5472/80/92c8ceefc59b33d4a7cb2949a1f528ad.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c550829f3.jpg/392x392/fit/80/b9789d6ffb6866fce8c98a42dd0d7de2.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66babf1876bda.jpg/1920x1080/resize/80/48e333b35e70dc706c2fc8a7625eaecd.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6682395fa763a.png/432x220/fit/80/49f662596b68c70f22105a2a5cde3a16.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bac1400fe06.jpg/432x220/fit/80/ab20b4358054fd884c0a41f820806608.jpg",
  "https://www.cinnamonhotels.com/skins/skin-prodcinnamonhotels/assets/desktop/images/cinnamondiscovery-logo.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67da4ffcbbd3e.jpg/1920x1080/resize/80/09525c630577921ecd50f8ea3b589fe2.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bac0e73eeb6.jpg/432x220/fit/80/37d09a53c535053b66f1471f1a332fc6.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66b3a7c05ab29.jpg/1920x1080/resize;c:1201,0,4339,3135/80/4b789c7ba60e9800f71963b186d09976.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cc063272819.jpg/1920x1080/resize;c:455,0,4105,3648/80/d04a1598dcebb208fe2a2d466271958e.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/669a103b2f5e7.jpg/1920x1080/resize/80/495044df2c9c1a95c3ddab0b8b5a58c2.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66babf32e775a.jpg/1920x1080/resize/80/fa386e3edda3722cd96a74971e4d6f75.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c63a011f8.jpg/392x392/fit/80/419c0f02518b6b8a3738a14b4e65e865.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6699ee2da0900.jpg/392x392/fit/80/f1125724ec5fd4ea8d087b59c064e3c7.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cc060f86d36.jpg/1920x1080/resize;c:757,0,3007,2250/80/667cf4e807b18b935e1fe5d0d5a70159.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66babe5fe11cb.jpg/432x220/fit/80/cdbf60e9059540f8f28996a7150ac231.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67da5bebb4def.jpg/1350x900/resize/80/870c7962b40ad3e89dd8483a170ec0c3.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66babf3b441cb.jpg/432x220/fit/80/1bb2eebf548573d628415244b6547568.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/680b0b985bc04.jpg/432x220/fit;c:0,461,1499,1225/80/4576657f54bf6d468198d84b16327d7d.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66babe621cf92.JPG/432x220/fit/80/5e8b48189f5d44cde15ed7ddd31bf24f.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67da8c7eb0eeb.jpg/1440x860/resize/80/b6e2c081ff771b90e6e5355b75842357.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66823f53aaa47.jpg/432x220/fit/80/76b6e8a619212e5f1f13aba9c3067a07.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cc05fe17245.jpeg/1920x1080/resize;c:1196,0,3446,2250/80/520306d62ea5e0cd77e9569e1deba045.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cc05f248c2c.jpg/1920x1080/resize;c:677,0,3412,2732/80/a954b99aa7e13c53ff73c1a0b91f23d7.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66b3ab114db46.jpg/432x220/fit/80/01d204cfc9cb62a4e694d27c9a9a704e.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bac12c569b9.jpg/432x220/fit/80/14b314595484679e26c8caa3e1474862.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/667e45c5cc530.jpg/432x220/fit/80/e97a035def0c8da65229a25dc78b07fa.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cdb2b643faf.png/432x220/fit;c:0,330,668,670/80/2e5b4e32fe486a2439624f534a0678d8.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cc05f98c466.jpg/1920x1080/resize;c:453,0,2703,2250/80/1cdb88da27548a68ca36c869e12df767.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66a70b7690363.jpg/392x392/fit/80/5dd7f2c25d733b6b296d61e23eaa8bfe.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bde0b9db05f.jpg/432x220/fit/80/66346a80157d329a6f9fa995cdaf257c.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cc05eb7c58d.jpg/1920x1080/resize;c:596,0,2266,1670/80/e0bbc3e44ef6bb64fa88c55b2f724c21.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bac4461e77d.jpg/1920x1080/resize;c:1072,0,4210,3135/80/434e05249931a991c0ab508fb992f0c2.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/667e2e623c8d2.jpg/432x220/fit/80/fd3b94a6af318aca5ba782270c82af0d.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c5eb88621.jpg/392x392/fit/80/ec84cdc140b0b810e74d3df6c9c86da4.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66babe772fea2.JPG/432x220/fit/80/62dfff412fd5e35de1349f2143e23261.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c4a9acede.jpg/392x392/fit/80/ae74f9041bad2445f80609d60ca2fe5b.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/imagepool/66bef92781c59.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66b4642c69a95.jpg/1920x1080/resize/80/020990ec5a3e9ce6077342896a2c9db3.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bac109b41ee.jpg/432x220/fit/80/649480a8f6d9589e5621770ae601d076.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67da5be9c1bcb.jpg/1350x900/resize/80/d7017c3c7cf1b16aed64c39dbffef2fd.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66a70d8434af9.jpg/392x392/fit/80/1ffb131ddea5382f0d2599f385ae811e.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cc05f90ede2.jpeg/1920x1080/resize;c:646,0,2896,2250/80/6bc719ea7c55b7cab9ac1c9247cd177a.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c52a52e3c.jpg/392x392/fit/80/dc50ae89831405a94c59bd6a2cd88bd8.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66babe6f7c2c7.JPG/432x220/fit/80/627aa25288c127d6c74bff74618260b7.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66baf078455cf.jpg/1920x1080/resize/80/423602ae2455dd1089c503e324ea6069.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd6f435b0d2.jpg/1920x1080/resize;c:0,391,1668,2058/80/67139c8f1985b0c3fdd0855635454fe3.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bd4979981c5.jpg/1920x1080/resize/80/9818b1c3f5a35203a0077a4d0083f9a8.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/669a110eb80f9.jpg/1920x1080/resize;c:1317,0,4965,3648/80/d92d74322998e28e0de34c9f5142e8f0.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd6f4ac4f7c.jpg/1920x1080/resize/80/8dd74c2f328b0b548d7ec1287e4fb0e8.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6682395fa763a.png/432x220/fit/80/49f662596b68c70f22105a2a5cde3a16.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66baf05681470.jpg/1920x1080/resize/80/3e7efea0dba612bbd7078ace4788481f.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/669a10f148be8.jpg/1920x1080/resize;c:695,0,4284,3588/80/b637705d2687d4a69d6a1e827822269c.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66baefc61f2f6.jpg/432x220/fit/80/581f78aee53b2c5f3d51a4f4c4ae11da.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd88eb94b47.JPG/432x220/fit;c:0,0,1024,521/80/cc6c060486c3510dd7727f1212414e1c.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66823f031f063.jpg/432x220/fit;c:0,515,4640,2878/80/d03bc2ff8fb1ae910ce6f94e3f66509e.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/667e45c5cc530.jpg/432x220/fit/80/e97a035def0c8da65229a25dc78b07fa.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67170fb8e8be4.jpg/432x220/fit;c:0,220,2480,1482/80/d04a0255bbba2e6615eaf0b6112cf77e.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5a730259ae.jpg/392x392/fit/80/a2c84431e7b846b2300ab618ac4815af.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bd49897b917.JPG/432x220/fit/80/ef2ccffc9bf10eb8d4de3b45af8de002.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd70be24fd3.jpg/1920x1080/resize/80/92c980cdc95677ba50d762c103b4350f.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67eb71b4c4dad.jpg/1920x1080/resize/80/783987d366d2ac7164bbd8a1ed4aea3b.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bd4979981c5.jpg/432x220/fit/80/e29569a2f7bc408be6fb732866c45051.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bd4981b9223.jpg/432x220/fit/80/cdaddb3732f4aa99c5a42247a5920f71.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/669a10ed10976.jpg/1920x1080/resize;c:1569,0,4708,3137/80/5cd2d0e38dbd7784586b990f4e803788.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cdb2b643faf.png/432x220/fit;c:0,330,668,670/80/2e5b4e32fe486a2439624f534a0678d8.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd70be20de3.jpg/1920x1080/resize;c:0,686,4115,4800/80/00a3c26dab08e86be5211585b0687fd4.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/667e9f686ff3a.jpg/432x220/fit/80/cd154b9a779799ca54685c243dc9b9e6.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5a78415928.jpg/392x392/fit/80/1782aeea3a5d7dc24a8797707f3f9411.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66a70b7690363.jpg/392x392/fit/80/5dd7f2c25d733b6b296d61e23eaa8bfe.jpg",
  "https://www.cinnamonhotels.com/skins/skin-prodcinnamonhotels/assets/desktop/images/cinnamondiscovery-logo.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66baf05681470.jpg/432x220/fit/80/83eba3f2df208b7d57e035901f5c2204.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd6f4533c07.jpg/1920x1080/resize;c:0,250,2000,2249/80/b3547c6e4b87d0d612ec74f28b01f214.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66baefaec7ab2.jpg/432x220/fit/80/2768f34359425b762ad042625b405eab.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd6f5eb1f7b.jpg/1920x1080/resize/80/1f72b12ff7d14a115bcbaf3e3ab8ae4a.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bde0b9db05f.jpg/432x220/fit/80/66346a80157d329a6f9fa995cdaf257c.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67eb78326eb51.jpg/1920x1080/resize/80/514a7036c39fefcd8488f996031bc395.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c4fcefafe.jpg/392x392/fit/80/e275cdf0f186a3374ff9a6a44f16f083.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6668a8780f181.jpg/432x220/fit/80/fc3c843ae110eb3847adcd35346f194f.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd6f4504fbd.jpg/1920x1080/resize/80/3d334f197c915e8c4fd2087f2a2b13f8.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66b49a8258d40.jpg/1920x1080/resize/80/0cb0bdf5d64c65c12c60e31f1c176a46.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6699de7114b98.jpg/392x392/fit/80/efabf8ab8b320e10da7a48b4ccf594c2.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6715db9e2d646.jpg/432x220/fit;c:0,1137,2002,2156/80/3401d514a0fe9726b49a41dc66d7047d.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bd497d56a22.jpg/432x220/fit/80/1bfa54ddc011eac1e155de89c28a04ef.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67cfef0844c7e.jpg/1920x1080/resize/80/ecbf2487abe9ae170c7b89a460129a15.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6715db9e2d646.jpg/1920x1080/resize/80/9444f29b5ba38d5e2efc253511d422f1.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66baefb877d4f.jpg/1920x1080/resize/80/0fdfae55d4f36799134913273bc9397d.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6655a75922252.jpg/392x392/fit/80/743963f742eb88581cd04e519b21a62c.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/667e2e623c8d2.jpg/432x220/fit/80/fd3b94a6af318aca5ba782270c82af0d.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/imagepool/66bef9276925e.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c5eb88621.jpg/392x392/fit/80/ec84cdc140b0b810e74d3df6c9c86da4.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c4a9acede.jpg/392x392/fit/80/ae74f9041bad2445f80609d60ca2fe5b.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c5c0cfe11.jpg/392x392/fit/80/eff7e005fc24dc2d06f3abf30677ec19.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd6f6358775.jpg/1920x1080/resize/80/790f987df13ab5a820e6ff49ef5ae38c.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c63a011f8.jpg/392x392/fit/80/419c0f02518b6b8a3738a14b4e65e865.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6699ee2da0900.jpg/392x392/fit/80/f1125724ec5fd4ea8d087b59c064e3c7.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bd497962b0a.jpg/432x220/fit/80/baa0b8b765f231edd26013623cdf4da0.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66baefb877d4f.jpg/432x220/fit/80/d6ce0837fb3a97acd95e59110c7b8859.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66b49a86aa2a5.jpg/1920x1080/resize/80/742320e004fcc15ce7310c9b8de11df8.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66baf078455cf.jpg/432x220/fit/80/5116d0083fee2b76ca0f21a08e4c3b7e.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bd497ab95a3.jpg/432x220/fit/80/547061f677d7eadede3eaa6e09ac0cc1.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5a5883ae73.jpg/392x392/fit/80/eaba082217fc2db7819d1501754a025b.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd70bdb6a86.jpg/1920x1080/resize/80/4c2c940694ecff55a0ee083ec8c1bbfd.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5a706aa0c9.jpg/392x392/fit/80/97f34e4f9dc69104d8c12b39341eb805.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5a7575d2a1.jpg/392x392/fit/80/ed464aeac594eab73d6b9b7c266fb61f.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66a70d8434af9.jpg/392x392/fit/80/1ffb131ddea5382f0d2599f385ae811e.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/6715dba1216bd.JPG/432x220/fit;c:0,706,4003,2745/80/4ef941b4f9168583458e1da836c7e9a6.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c550829f3.jpg/392x392/fit/80/b9789d6ffb6866fce8c98a42dd0d7de2.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/667e1ec8c5e54.png/432x220/fit/80/61644a84d8f4a20beff52c114815ed9a.png",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66f4f2ce01223.JPG/1920x1080/resize/80/032d615842ef4178508a8e97416f361e.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/68f5c52a52e3c.jpg/392x392/fit/80/dc50ae89831405a94c59bd6a2cd88bd8.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66bd497991037.jpg/432x220/fit/80/e1fa0fcd12ef46964e7c289245d9dd9f.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/669a11014985b.jpg/1920x1080/resize/80/c644babddc4eb5c879005533ec38f2aa.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cd70bf3bee6.jpg/1920x1080/resize/80/a8239880cc15298b5f20d4a05828eb6d.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/67d11a0989d62.jpg/1920x1080/resize/80/0c0fc60a9ad98df51fd8b2f362327670.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66823f53aaa47.jpg/432x220/fit/80/76b6e8a619212e5f1f13aba9c3067a07.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66cc63d7c1eb9.jpg/1920x1080/resize;c:0,1362,4082,5443/80/10e64fde650201e6b1eb87afa47f533b.jpg",
  "https://d18slle4wlf9ku.cloudfront.net/www.cinnamonhotels.com-1302818674/cms/cache/v2/66a70d8434af9.jpg/392x392/fit/80/1ffb131ddea5382f0d2599f385ae811e.jpg",
  "https://lh3.googleusercontent.com/p/AF1QipMhB1q1k_Jd6n4K5p6g-8o_J8Lz1J8Lz1J8Lz1=s1280-w1280-h800",
  "https://lh3.googleusercontent.com/p/AF1QipN5p6g-8o_J8Lz1J8Lz1J8Lz1J8Lz1J8Lz1J=s1280-w1280-h800",
  "https://lh3.googleusercontent.com/p/AF1QipMhB1q1k_Jd6n4K5p6g-8o_J8Lz1J8Lz1J8Lz2=s1280-w1280-h800",
  "https://lh3.googleusercontent.com/p/AF1QipN5p6g-8o_J8Lz1J8Lz1J8Lz1J8Lz1J8Lz1J=s1280-w1280-h800"
]);

// === 규칙 기반 필터(선택) ===
const EXCLUDE_PATTERNS = [
  /\/wp-content\/themes\/.*\/(bg|close|icon|logo|placeholder)[^/]*\.(png|jpg|jpeg|svg)$/i,
  /footer/i,
];

const resortsDir = path.resolve("api");

const shouldExclude = (url) => {
  if (!url || typeof url !== "string") return false;
  const u = url.trim();
  if (EXCLUDED_URLS.has(u)) return true;
  return EXCLUDE_PATTERNS.some((re) => re.test(u));
};

let totalRemoved = 0;
let totalKept = 0;

fs.readdirSync(resortsDir)
  .filter((f) => /^resorts.*\.json$/i.test(f))
  .forEach((file) => {
    const fullPath = path.join(resortsDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    let data;

    try {
      data = JSON.parse(content);
    } catch {
      console.error(`❌ JSON parse error in ${file}`);
      return;
    }

    let modified = false;
    const cleaned = data.map((resort) => {
      if (!Array.isArray(resort.imageUrls)) return resort;
      const before = resort.imageUrls.length;
      const kept = resort.imageUrls.filter((url) => !shouldExclude(url));
      const removed = before - kept.length;
      if (removed > 0) {
        modified = true;
        totalRemoved += removed;
        totalKept += kept.length;
      }
      return { ...resort, imageUrls: kept };
    });

    if (modified) {
      fs.writeFileSync(fullPath, JSON.stringify(cleaned, null, 2), "utf-8");
      console.log(`✅ Cleaned ${file}`);
    } else {
      console.log(`ℹ️ No change in ${file}`);
    }
  });

console.log(`\nDone! Removed ${totalRemoved} URLs, kept ${totalKept}.`);
