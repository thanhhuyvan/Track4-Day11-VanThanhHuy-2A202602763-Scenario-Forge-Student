MSSV: 202602763

# Lab 11 · Scenario Forge — báo cáo

**Họ tên:** Văn Thành Huy · Bài cá nhân. Mã định danh đầy đủ: 2A202602763; mã số dùng trong lab là **202602763**, theo lựa chọn bỏ tiền tố 2A. Mọi evidence dùng cùng mã và seed do đề sinh, không đổi seed để chọn kết quả.

**Kết quả chính:** MC có 3/3000 lỗi; median IS total≈0,00133349 nhưng bất định lớn. Policy chọn trên TRAIN là cutinLat=3,0; TEST giảm điểm ước lượng lỗi, tiến độ mất khoảng 0,075%, nhưng vẫn chưa chứng nhận lỗi hiếm đã biến mất. Hazard xe đạp bổ sung còn 577/1500 lỗi tránh được với policy sửa, trên một cảnh có điều kiện.

**Nguồn số liệu:** [replay](evidence/replay.json), [MC](evidence/mc.json), [hunt](evidence/hunt.json), [IS](evidence/estimate.json), [policy](evidence/fix.json), [hazard](evidence/mine.json), [provenance](evidence/meta.json). Không dùng --quick cho bằng chứng nộp. Các số làm tròn trong báo cáo chỉ để trình bày; JSON giữ độ chính xác gốc.

Thị trấn của bạn (`meta.json: _run.town`): B

## 1. Phát lại log có trung thực không? (bước A)

`replay.json`: 400 kịch bản, không log nào bị loại do người lái va chạm, nên n_used=400. Replay có **121** va chạm (rear=110, side=11), reactive có **0**; crash_in_both=0. Đây là quan sát trên 400 kịch bản, không chứng minh planner không bao giờ va chạm.

Trong replay, tác nhân khác đi đúng quỹ đạo log của người lái, không phản ứng với việc planner phanh sớm hơn. Xe sau có thể đi vào xe ego đã giảm tốc dù trong thế giới phản ứng nó sẽ phanh theo; 110/121 va chạm replay thuộc rear. Bản world mặc định cũng có ego–TG contact giả tại t=14,8 s.

Ví dụ `replay.json: replay_only[0]` là scenario=1. Đã chạy lại riêng ba chế độ và lưu [replay_example.json](evidence/replay_example.json), ngoài số tổng chính thức. Replay có ego–C2 contact **side tại 12,35 s**, fake=true; human và reactive không có ego-event, min_ttc_reactive=7,46063 s. Ở cùng frame, ego người lái đã tới x=99,50 m nhưng ego planner chỉ x=90,09 m. C2 trong log/replay giữ x=88,32 m, z=3,59 m và đang lấn từ E2 sang E1, nên cắt vào cạnh ego planner. Trong bản reactive, C2 vẫn ở z=5,25 m (làn E2), a≈−2,20 m/s²: nó chờ/phanh theo tình trạng thật thay vì thực hiện quỹ đạo log. Đây là khác biệt tương tác, không phải chứng minh planner chắc chắn an toàn ở mọi tình huống.

## 2. Kịch bản bất khả thi (bước B)

`lab11/feasible.py` loại: gia tốc ngang chuyển làn (π/cutDur)^2×3,5/2 vượt μg; cutBrake vượt μg; pedV>2,5 m/s; cutV ngoài (0;22] m/s. Ngoài ra đầu vào phải hữu hạn, cutDur và μ dương. Hai luật đầu dựa trên giới hạn ma sát, luật sau giới hạn miền tốc độ của mô hình dạy học, không phải hằng số vật lý áp dụng cho mọi người đi bộ/xe.

CEM chọn kịch bản nguy hiểm nên dễ bị kéo về chuyển làn quá gấp hoặc phanh vượt ma sát. Nếu đếm những kịch bản đó là thất bại, ước lượng sẽ tính thêm các tình huống nằm ngoài miền khả thi đã định nghĩa. Theo hunt.json, crosswalk_block loại nhiều nhất: 28/2400 kịch bản; bus_bypass=2, cut_in=2, rear_ended=7. Tổng MC có 22 đầu vào bất khả thi được loại khỏi mô phỏng. Không dùng số đếm CEM làm tần suất tự nhiên.

## 3. Monte Carlo cho bạn biết gì (bước C1)

`mc.json`: k=3, n=3000, p̂=0.001000; Wilson 95%=[0.000340141; 0.002936197]. Cả 3 vụ đều bus_bypass. Với p≈0,001, công thức xấp xỉ n≈96/p cho sai số ±20% tương đối cần **96.000** lượt, khoảng 32 lần ngân sách MC hiện tại. Đây là dự trù dựa trên p̂ còn rất bất định.

Các kiểu cut_in, crosswalk_block, rear_ended và other chưa xuất hiện trong MC. Không báo xác suất thật bằng 0: mỗi kiểu có Wilson upper=0.001278896 với 0/3000 lượt. Phân biệt số đếm quan sát 0 với cận trên xác suất. MC không thay thế cuộc săn các kiểu hiếm.

## 4. Importance sampling, ESS và độ suy biến (bước C3)

| Seed | Kiểu | p ước lượng | Hits | ESS | top_share |
|---:|---|---:|---:|---:|---:|
| 0 | bus_bypass | 0.0017681 | 51 | 127.15 | 0.4968 |
| 0 | cut_in | 0 hit; upper=0,025 | 0 | 118.49 | 0.0000 |
| 0 | crosswalk_block | 3.40515e-06 | 106 | 138.61 | 0.5027 |
| 0 | rear_ended | 0 hit; upper=0,025 | 0 | 106.14 | 0.0000 |
| 1 | bus_bypass | 0.00087529 | 57 | 129.99 | 0.4156 |
| 1 | cut_in | 0 hit; upper=0,025 | 0 | 108.32 | 0.0000 |
| 1 | crosswalk_block | 1.27161e-06 | 129 | 113.18 | 0.2885 |
| 1 | rear_ended | 0 hit; upper=0,025 | 0 | 133.82 | 0.0000 |
| 2 | bus_bypass | 0.000827008 | 47 | 123.30 | 0.3009 |
| 2 | cut_in | 0 hit; upper=0,025 | 0 | 125.76 | 0.0000 |
| 2 | crosswalk_block | 0.000506485 | 107 | 119.69 | 0.9949 |
| 2 | rear_ended | 0 hit; upper=0,025 | 0 | 131.32 | 0.0000 |

Tổng ước lượng qua ba seed lần lượt 0.00177150, 0.00087656, 0.00133349; trung vị **0.00133349**, so với MC 0,001. Các tổng chênh nhau khoảng 2.02 lần; khoảng báo bởi pipeline chồng nhau và bao giá trị MC, nhưng không đủ để xác nhận hai phương pháp đã chính xác.

`top_share` là phần tổng w*y do một mẫu lớn nhất đóng góp. Crosswalk_block seed 0 có top_share=0,5027 và seed 2 **0,9949**: gần 99,49% estimate seed 2 do một mẫu quyết định. Seed 2 p≈5,06e-4 cao hơn seed 1 p≈1,27e-6 khoảng 398 lần dù hits gần nhau (107 và 129). ESS đo độ lệch của toàn bộ trọng số, không đo trực tiếp số mẫu lỗi hữu ích. top_share thấp cũng không chứng minh proposal đã bao phủ mọi vùng lỗi.

Budget=16.800 gồm 9.600 mẫu săn + 7.200 mẫu IS (4 kiểu×3 seed×600); chưa gồm MC 3.000 dùng cho other. MC muốn khoảng ±20% tương đối tại p≈0,001 cần xấp xỉ 96.000 lượt. Với crosswalk_block p≈1,27e-6 theo seed 1, cùng công thức cho khoảng 75 triệu lượt; đây chỉ là dự trù rất nhạy theo p. **Không nói IS đã đạt cùng độ chính xác ±20%**: ví dụ bus_bypass seed 1 có 1,96*se/p≈86,7%, còn crosswalk_block seed 2 có relative half-width≈195%. IS tìm được nhiều lỗi hơn trong ngân sách nhỏ nhưng kết quả còn suy biến.

`other` lấy từ MC: 0/3000 quan sát, Wilson upper=0,001278896; pipeline không săn other vì không có một điểm nguy hiểm chung đáng tin cho phần dư. Chưa thấy other không có nghĩa p thật bằng 0.

Cut_in và rear_ended đều zero-hit trong ba seed; dùng **upper_zero_hits=3/(0,2×600)=0,025** cho từng kiểu/seed, không dùng hi=0 của xấp xỉ Gaussian và không thay n bằng ESS. Các khoảng tổng lo/hi trong estimate.json cộng phần other nhưng không cộng các cận zero-hit này cho mọi mode; vì vậy không gọi hi tổng là chứng nhận 95% cho tất cả kiểu chưa thấy. Stage 5 fix có cơ chế fail_hi riêng để xử lý kiểu unseen.

## 5. Các kiểu thất bại (bước C2 + 3D)

| Cuộc săn | Các kiểu tìm được | Bất khả thi bị loại |
|---|---|---:|
| bus_bypass | {'bus_bypass': 163} | 2 |
| cut_in | {'bus_bypass': 30, 'crosswalk_block': 2} | 2 |
| crosswalk_block | {'crosswalk_block': 64, 'bus_bypass': 1} | 28 |
| rear_ended | {'bus_bypass': 36, 'crosswalk_block': 3} | 7 |

Mỗi cuộc săn có 8 vòng × 300 mẫu; cloud.json có 9600 điểm gồm cả đầu vào bị loại. Hai cuộc săn đúng đích bus_bypass và crosswalk_block tìm được lần lượt 163 và 64 thất bại đúng kiểu. Cuộc săn cut_in/rear_ended chưa tìm thấy thất bại đúng đích; chúng lại tìm được các kiểu khác. Điều này không chứng minh hai kiểu đó không tồn tại. Một cuộc săn chung có thể co về kiểu dễ tìm và bỏ qua các cơ chế khác. Ảnh dưới chụp viewer gốc chương 9, dùng tham số nguyên độ chính xác từ evidence/viewer.json, không dùng mẫu giảng viên. Trong hai ảnh lỗi, xe đặc được pin ở policy gốc của cuộc săn, bóng mờ là policy sửa; nhãn UI cố định “chính sách của bạn/gốc” có thể đảo nghĩa trong chế độ run được pin. Ảnh FIX-01 ở câu 6 dùng policy sửa làm xe chính và policy gốc làm bóng, khớp nhãn UI.

**Bus bypass, B-01:** xe C2 lách qua xe buýt đỗ và lấn sang làn ego. Trên đường ướt μ=0,5, khe chấp nhận 6,1 m, policy gốc nhận xe lấn là leader quá muộn và chạm C2 lúc **t=12,45 s**. Tại sự kiện C2 x=95,28 m, v=1,09 m/s; ego x=90,76 m, v=5,02 m/s. C2 thỏa điều kiện x<112, v<6 của mode bus_bypass.

![Bus bypass](evidence/shots/bus_bypass.png)

**Crosswalk block, C-01:** người đi bộ không ngó qua xe buýt (pedLook=0), xuất hiện trên vạch; ego phanh và đứng lại nhưng thân xe chắn đường đi. Sự kiện **kind=block tại t=20,9 s**, không phải người đi bộ bước vào thân xe: ego x=119,73 m và P1 x=122 m, cả hai v=0. Bản sửa cutinLat không giải quyết được cảnh này; bóng và xe chính cùng chặn lối.

![Crosswalk block](evidence/shots/crosswalk_block.png)

## 6. Sửa planner (bước E + 3D)

`fix.json`: chọn **cutinLat=3,0 m** (gốc 2,15 m), các núm còn lại giữ mặc định. Bộ chọn chỉ dùng table TRAIN: đủ tiến độ ≥95% baseline_train, sau đó tối thiểu fail_hi, hòa thì ưu tiên tiến độ cao hơn. 12 ứng viên dùng cùng TRAIN draws. Đã đối chiếu choose_policy chạy lại trên table cho đúng chosen; không chọn lại theo TEST.

| Tập / policy | fail | fail_hi_seen | fail_hi | Tiến độ m | Frame phanh gấp trung bình |
|---|---:|---:|---:|---:|---:|
| TRAIN gốc | 0.0020632338 | 0.0036233425 | 0.0036233425 | 219.9791 | 7.6016 |
| TRAIN chọn | 1.4358707e-06 | 2.2340737e-06 | 2.2340737e-06 | 219.9605 | 7.4805 |
| TEST gốc | 0.0006906345 | 0.0012386843 | 0.00251758 | 213.7865 | 8.5803 |
| TEST chọn | 3.8243457e-08 | 7.5920836e-08 | 0.038778972 | 213.6267 | 8.2473 |

TEST dùng seed mới, săn lại cho từng policy và tập tự nhiên riêng 3000 kịch bản. Mất tiến độ **0.0747%** so policy gốc TEST, dưới 5%. harsh là **số frame a<−3 m/s² trung bình mỗi kịch bản**, không phải số lần bắt đầu một đợt phanh riêng biệt. Quãng đường dừng tính tại va chạm, không cộng phần chạy tiếp sau đó.

Bản sửa có fail rất nhỏ nhưng bus_bypass zero-hit, nên TEST cộng **3/(0,2×400)=0,0375** cho mode này; phần other zero/3000 cộng Wilson upper=0,001278896. Vì vậy fail_hi≈0,038779 lớn hơn fail_hi gốc≈0,002518 và lớn hơn cả point fail của gốc. Điều đó không chứng minh bản sửa kém hơn: ngân sách chỉ đủ quan sát xu hướng, chưa đủ chứng nhận đã loại lỗi hiếm. Không dùng fail_hi_seen≈7,59e-8 như cận an toàn đầy đủ của policy. Với yêu cầu riêng một mode zero-hit upper<1e-3, cần trên 15000 mẫu của mixture này.

Ảnh FIX-01 dùng **cùng tham số B-01**, policy sửa làm xe chính và policy gốc làm bóng mờ. Ego sửa nhận xe lấn là leader sớm hơn; không có ego-event trong rollout 24 s, trong khi bóng policy gốc chạm C2 lúc 12,45 s. File viewer_capture.json chỉ thêm run so sánh, không thay thế evidence/viewer.json chính thức hoặc thay tham số thế giới.

![Policy sửa và bóng gốc](evidence/shots/policy_fix_ghost.png)

Ví dụ núm nghe an toàn hơn: T=2,0 (gốc 1,6) cho TRAIN fail≈0,00274, hi≈0,00563, cao hơn gốc TRAIN fail≈0,00206, hi≈0,00362. Khoảng còn rộng, chưa chứng minh tăng xác suất thật. Một cơ chế khả dĩ là ego chừa khe lớn hơn khiến xe khác chấp nhận cắt vào, rồi phanh/nhường lại tạo tình huống khác; đây là giả thuyết về tương tác, không kết luận nhân quả chỉ từ bảng. cautionV=5 cũng giảm tiến độ xuống 175,6 m, không qua ràng buộc tiến độ. Không sửa policy theo số TEST công khai.

## 7. Từ mô phỏng ra đường thật

Ba giả định của town B dưới đây lấy từ `avsim/space.py`; **chưa được hiệu chuẩn bằng dữ liệu thực**. Các nguồn được đề xuất để thu thập/hiệu chuẩn, không phải dữ liệu tôi đã dùng chạy lab.

| Giả định mô phỏng | Dữ liệu thật cần có và nguồn cụ thể | Hướng lệch có thể có |
|---|---|---|
| Khe chấp nhận cutGap có median 12 m, lognormal sigma=0,5, kẹp [1;60] m | Quỹ đạo xe trước/sau lúc bắt đầu chuyển làn, khe dọc, tốc độ tương đối và trường hợp chờ không nhập làn. Có thể xây quy trình từ [inD — quỹ đạo tại giao lộ](https://arxiv.org/abs/1911.07602), sau đó đo camera/drone tại đúng phố có xe buýt của tuyến triển khai; không chuyển nguyên phân phối đường cao tốc vào phố | Nếu người thực tế thường chấp nhận khe nhỏ hơn mô hình, có thể tăng tình huống lấn gần ego mà mô hình bỏ sót, khiến rủi ro bị đánh giá thấp. Chiều tác động tổng còn phụ thuộc tốc độ và việc ego/xe sau nhường; cần sensitivity study chứ không khẳng định đơn điệu |
| pedLook Bernoulli=0,85; pedGap lognormal median 4,5 s, sigma=0,35, kẹp [0,5;15] s | Video đồng bộ từ lề và ego ở điểm xe buýt che khuất; gán nhãn nhìn/ngó trước khi qua, thời điểm bắt đầu, TTC có thể nhìn thấy và tuổi/điều kiện giao thông theo quy trình bảo vệ riêng tư. Quỹ đạo từ camera trên cao không đủ kết luận hướng nhìn; cần góc quay thích hợp | Nếu tỷ lệ nhìn thực tế thấp hơn 0,85 hoặc người qua đường chấp nhận gap nhỏ hơn, mô hình có thể đánh giá thấp sự xuất hiện bất ngờ và lỗi crosswalk. Đây là giả thuyết cần kiểm chứng, không phải mức giảm rủi ro đo được |
| Wet Bernoulli=0,30, μ=0,5 khi ướt và 0,8 khi khô | Nhật ký mưa/độ ướt theo tuyến và thời gian chạy để ước lượng exposure; đo phanh với lốp/xe đại diện, kết hợp khảo sát ma sát và macrotexture mặt đường. [FHWA friction primer](https://highways.fhwa.dot.gov/safety/rwd/keep-vehicles-road/pavement-friction/pavement-friction-road-safety-primer-friction) mô tả các phương pháp đo; chỉ số thiết bị không tự động bằng hệ số μ của xe | Nếu μ thực thấp hơn giá trị mô phỏng, ở cùng tốc độ quãng phanh v²/(2μg) dài hơn nên mô phỏng có thể quá lạc quan. Tăng tỷ lệ đường ướt không nhất thiết làm xác suất đa tác nhân tăng đơn điệu vì mọi tác nhân cũng phản ứng |

Ba biến có thể tương quan (mưa ảnh hưởng tốc độ/khe nhìn và hành vi). Hiện lab lấy các latent độc lập; hiệu chuẩn từng phân phối biên riêng chưa đủ tái tạo phần đuôi rủi ro chung.

## 8. Giới hạn

1. **Phạm vi cảnh:** một đoạn phố, vị trí xe buýt/vạch cố định, horizon 24 s. Kết quả không phải xác suất tai nạn mỗi km/năm hoặc ở giao lộ, tuyến, mật độ xe khác. Hazard world=scene chỉ quét quanh một nền giao thông cố định.
2. **Hành vi và điều khiển:** tác nhân IDM/gap acceptance và đường chuyển động được lập trình, ego chủ yếu điều chỉnh tốc độ. Chưa bao phủ phản ứng con người đa dạng, vi phạm giao thông hoặc mọi chiến lược đánh lái; oracle phanh không phải người lái thật.
3. **Cảm biến, vật lý và nhãn:** planner dùng trạng thái mô phỏng và mô hình che khuất, không có pipeline camera/LiDAR học từ dữ liệu với đầy đủ false positive, độ trễ và calibration drift. Xe là hộp va chạm và ma sát đơn giản; crosswalk_block là một nhãn thất bại vận hành, không phải contact vật lý. Tổng xác suất failure bao gồm cả nhãn này, không nên gọi tất cả là tai nạn gây thương tích.

**Nếu có thêm một tuần:** cố định policy trước; thu thập các dữ liệu ở câu 7, đánh giá sensitivity có tương quan trên một số cấu hình đường khác, và mở rộng số mẫu/seed. Ưu tiên paired comparison và phần đuôi mà top_share lớn; báo cận cho zero-hit thay vì săn đến khi có một con số đẹp. Với mục tiêu riêng upper<10⁻³ cho mode zero-hit trong mixture beta=0,2, cần hơn 15000 mẫu cho mode đó; chưa dùng ngân sách hiện tại để chứng nhận tiêu chuẩn đó.

## 9. Rắc rối của bạn (bước G + chương 10)

**Rắc rối:** một xe đạp ở E2 lạng sang E1 khoảng một bề rộng làn (3,0–3,6 m), mô phỏng tránh một chướng ngại ở làn bên. Không khẳng định có ổ gà/xe đỗ trong model nếu không có actor đó: đó là động cơ ngoài đời để thiết kế card. Cảnh được nhập rồi xuất lại bằng chương 10; file `hazard.json` giữ format, params, policy và hazards đầy đủ. Cảnh cụ thể gốc có ego–H0 contact ở **8,9 s**, JS và Python cùng thời điểm.

**Thiết kế và căn cứ:** một grid thử 18 trường hợp xe đạp trước đánh giá đã tìm thấy các va chạm tránh được, sau đó chốt space và không đổi sau mine. x=10–40 m là lân cận vị trí dựng x=25 m trên đoạn thẳng; trig=10–18 m thử sự lạng gần xe, không phải phân phối khe thực nghiệm. v=3,5–4,5 m/s (12,6–16,2 km/h) nằm trong khoảng quan sát 12–20 km/h được thảo luận trong [FHWA-HRT-05-137, chương 2](https://www.fhwa.dot.gov/publications/research/safety/pedbike/05137/chapter2.cfm). Nguồn này chỉ hỗ trợ độ lớn tốc độ, không chứng minh khoảng uniform hay tần suất cho thị trấn mô phỏng. swDur=2,7–3,0 s đảm bảo a_lat tối đa π²×3,6/(2×2,7²)≈2,44 m/s², dưới giới hạn 3 m/s² của studio; quãng lạng lấy từ bề rộng làn mô phỏng 3,5 m. Chi tiết có trong hazard.json: why.

**Miền suy luận:** dùng `world: scene`, giữ nguyên giao thông của cảnh và quét 5 trường hazard. `exposure=1` nghĩa một card được chèn vào mỗi episode do thiết kế, **không phải** tần suất mỗi chuyến ngoài đời. Pipeline không sinh per_trip và không nhân exposure để so với bus_bypass của town B. Cần thống kê gặp xe đạp trên tuyến và quỹ đạo thực tế mới suy ra rủi ro mỗi chuyến. Đây là lựa chọn thử nghiệm có điều kiện được README cho phép, không thay đổi phân phối town B hoặc seed.

**Kết quả:** accepted=1500/1500=100%; không có overlap lúc bắt đầu, không kịch bản bất khả thi. Mỗi policy đánh giá trên cùng 1500 biến thể bằng seed của đề.

| Policy | n | Va chạm | Avoidable | Unavoidable | Unattributed | Low-speed | Foreknown avoidable | p lỗi có điều kiện | Wilson 95% |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Gốc | 1500 | 1070 | 1070 | 0 | 0 | 0 | 1070 | 0.713333 | [0.689926; 0.735650] |
| cutinLat=3,0 | 1500 | 577 | 577 | 0 | 0 | 3 | 577 | 0.384667 | [0.360370; 0.409553] |

Policy sửa giảm lỗi có điều kiện từ 0,713333 xuống 0,384667, chênh lệch tuyệt đối 0,328667, giảm tương đối **46.07%** trong dải thử này. Vẫn còn 577 lỗi tránh được, nên bản sửa stage 5 không giải quyết đầy đủ hazard xe đạp. Ba va chạm low_speed của bản sửa vẫn nằm trong avoidable, không cộng thêm lần nữa. Không có khoảng cách giữa avoidable và avoidable_foreknown trong lượt này; không suy rộng thành che khuất không quan trọng ở cảnh khác.

**Oracle và diễn giải:** avoidable là phanh tối đa ngay khi hazard bắt đầu và nhìn thấy, với tiền tố rollout giống planner gốc. Phản ứng tức thì và hiểu đúng nguy cơ là lạc quan, có thể đếm nhiều lỗi hơn mức planner thực tế tránh được. Ngược lại oracle chỉ thử phanh, chưa thử đánh lái, nên có thể bỏ sót cách tránh khác. Các tỷ lệ trên là nhãn theo chuẩn oracle, không phải ground truth an toàn thực địa.

**Ảnh cảnh gốc, chương 10:**

![Xe đạp lạng sang làn ego](evidence/shots/hazard_studio.png)

**Ảnh một lỗi còn lại của policy sửa, GC-01:** chạm H0 lúc 7,2 s; hazard bắt đầu và oracle bắt đầu phanh lúc 5,4 s theo mine.json: chosen.examples[0]. Tham số này lấy nguyên từ biến thể của cuộc quét, không phải cảnh exact 8,9 s.

![Policy sửa vẫn chạm xe đạp](evidence/shots/hazard_chosen_failure.png)

**Tự lái:** chưa thực hiện thử nghiệm người lái; không có egoAcc và không khẳng định bản thân tránh được.

**Đề xuất sửa tiếp:** thêm dự đoán hành lang chiếm chỗ theo vận tốc ngang của bike, tính time-to-lane-entry trước khi khoảng ngang rơi vào ngưỡng leader; giảm tốc nếu hành lang bike giao đường ego trong horizon ngắn. Chỉ tăng cutinLat là heuristic hữu ích nhưng không bao phủ chuyển động ngang liên tục. Chưa triển khai hoặc chọn lại policy trên dữ liệu mine để tránh báo một phép sửa hậu nghiệm như kết quả đã đo.


## Tái lập và kiểm tra bài nộp

- Python 3.12.10, NumPy 2.5.4, pytest 9.1.1; Node.js v24.21.0. Phiên bản môi trường trong `requirements-local.lock.txt`, lệnh Windows trong [LOCAL_SETUP.md](LOCAL_SETUP.md).
- `meta.json: steps` ghi world, replay, mc, hunt, estimate, fix, mine và export đều quick=false. Ngân sách: MC 3000; hunt 4×8×300; IS 3×4×600; fix 12 ứng viên, 400 mẫu/mode và holdout TEST 3000; mine 1500 biến thể.
- Chỉ triển khai 10 TODO trong lab11; không sửa avsim/, viewer/, run_all.py, tests/ hoặc policy_candidates.json. Các file supplementary replay_example, viewer_capture và capture metadata được ghi riêng, không thay kết quả pipeline chính thức.
- Đã kiểm thử TODO và parity Python–JS; audit cuối lưu trong `evidence/submission_audit.json`. Audit đối chiếu bằng chứng và file, không thay thế grader với bộ test/seed bí mật. Không tuyên bố điểm chấm khi chưa có grader.
- Mã, thực thi và biên tập báo cáo có trợ giúp Codex. Số liệu lấy từ các lần chạy thực tại local; không thực hiện tự lái và không giả định đã thu thập dữ liệu đường thật.
