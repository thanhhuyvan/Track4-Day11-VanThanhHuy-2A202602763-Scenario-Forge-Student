MSSV: 202602763

# Lab 11 · Scenario Forge — báo cáo

Mỗi câu: trả lời ngắn, **trích số từ `evidence/`** (ghi tên file và trường, ví dụ `mc.json: crashes = 4`). Grader chạy lại với MSSV của bạn; số không khớp `evidence/` thì mất điểm phần D (RUBRIC), và câu dựa trên số sai khó được điểm đầy đủ. Không cần văn hay: một bảng nhỏ và hai, ba câu giải thích là đủ.

Thị trấn của bạn (`meta.json: _run.town`): B

## 1. Phát lại log có trung thực không? (bước A)

`replay.json`: 400 kịch bản, không log nào bị loại do người lái va chạm, nên n_used=400. Replay có **121** va chạm (rear=110, side=11), reactive có **0**; crash_in_both=0. Đây là quan sát trên 400 kịch bản, không chứng minh planner không bao giờ va chạm.

Trong replay, tác nhân khác đi đúng quỹ đạo log của người lái, không phản ứng với việc planner phanh sớm hơn. Xe sau có thể đi vào xe ego đã giảm tốc dù trong thế giới phản ứng nó sẽ phanh theo; 110/121 va chạm replay thuộc rear. Bản world mặc định cũng có ego–TG contact giả tại t=14,8 s.

Ví dụ replay_only[0] là scenario=1, contact=side; reactive không va chạm và min_ttc_reactive=7,46063 s. Cần xem chương 9 sau export để mô tả chính xác chuỗi chuyển động của ví dụ này; chưa suy diễn tác nhân chỉ từ contact=side.

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

Mỗi cuộc săn có 8 vòng × 300 mẫu; cloud.json có 9600 điểm gồm cả đầu vào bị loại. Hai cuộc săn đúng đích bus_bypass và crosswalk_block tìm được lần lượt 163 và 64 thất bại đúng kiểu. Cuộc săn cut_in/rear_ended chưa tìm thấy thất bại đúng đích; chúng lại tìm được các kiểu khác. Điều này không chứng minh hai kiểu đó không tồn tại. Một cuộc săn chung có thể co về kiểu dễ tìm và bỏ qua các cơ chế khác. Ảnh 3D và chuỗi sự kiện cụ thể sẽ được bổ sung ở stage 5 sau export; chưa mô tả diễn biến chưa quan sát.

## 6. Sửa planner (bước E + 3D)

`fix.json`: policy được chọn, `fail` và `fail_hi` trên TRAIN, trên TEST (`fail_hi_seen` và `fail_hi`), và của policy gốc trên TEST; vì sao `fail_hi` của bản sửa có thể lớn hơn `fail` của policy gốc dù bản sửa tốt hơn thật? quãng đường và số lần phanh gấp. Một ảnh chụp 3D có **bóng mờ** (policy gốc) cho một kịch bản mà bản sửa tránh được. Có núm chỉnh nào "nghe thì an toàn hơn" nhưng thực tế làm tăng thất bại? Giải thích bằng cách thế giới phản ứng lại.

## 7. Từ mô phỏng ra đường thật

Phân phối tự nhiên trong `space.py` là giả định. Chọn **ba** giả định ảnh hưởng nhiều nhất đến con số của bạn (ví dụ khe chấp nhận của xe chuyển làn, tỉ lệ người đi bộ ngó qua xe buýt, ma sát đường ướt). Với mỗi cái: dữ liệu thật nào sẽ thay nó, lấy từ đâu, và nếu nó sai thì con số của bạn sai theo hướng nào?

## 8. Giới hạn

Ba điều mà xác suất bạn báo **không** nói, ví dụ: thế giới chỉ có một con phố; người lái chỉ là IDM; cảm biến hoàn hảo trừ phần bị xe buýt che. Nếu được thêm một tuần, bạn sẽ đo gì tiếp?

## 9. Rắc rối của bạn (bước G + chương 10)

- **Rắc rối:** bạn dựng gì, và ngoài đời nó giống tình huống nào.
- **Căn cứ:** vì sao bạn nghĩ planner sẽ xử lý kém.
- **Giả định:** `space` và `exposure` lấy từ đâu (`hazard.json: why`).
- **Kết quả**, theo `mine.json`:
  - số va chạm `avoidable` (tránh được bằng phanh hết cỡ, biết trước), `unavoidable`, `unattributed`, và `low_speed`, với policy gốc và với policy bạn chọn; `accepted` (bao nhiêu phần `space` của bạn là khả thi);
  - P(lỗi planner | rắc rối) kèm khoảng Wilson;
  - tần suất mỗi chuyến, đặt cạnh tần suất lách xe buýt của bạn.
- **Hình:** một ảnh chương 9 hoặc 10 ở lúc va chạm.
- **Bạn tự lái thì sao:** nếu bạn đã thử lái, bạn tránh được không, và bạn làm gì khác planner?
- **Cách sửa:** núm chỉnh nào sửa được rắc rối này? Nếu không núm nào sửa được, planner cần thêm **logic gì** (mô tả, không cần code)?
