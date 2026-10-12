export interface MbtiPersonality {
  type: string;
  name: string;
  role: string;
  summary: string;
  traits: string[];
  learningEnvironment: string[];
  strengths: string[];
  suggestedMajors: Array<{
    id: string; // mã ngành hoặc slug
    name: string;
    code: string;
    faculty: string;
    matchReason: string;
    tag: string;
  }>;
}

export const MBTI_PERSONALITIES: Record<string, MbtiPersonality> = {
  INTJ: {
    type: "INTJ",
    name: "Nhà Kiến Tạo / Nhà Chiến Lược",
    role: "Architect / Mastermind",
    summary:
      "Tư duy độc lập, tầm nhìn chiến lược dài hạn, logic chặt chẽ và khả năng thiết kế kiến trúc hệ thống phức tạp với tính ứng dụng cao.",
    traits: [
      "Tư duy trừu tượng và giải quyết bài toán phức tạp",
      "Tiêu chuẩn công việc rất cao và quyết đoán",
      "Thích tự nghiên cứu sâu các quy trình hệ thống",
      "Khả năng quy hoạch và lập chiến lược tổng thể",
    ],
    learningEnvironment: [
      "Môi trường chú trọng tư duy thuật toán, hệ thống kỹ thuật lớn, dự án R&D độc lập.",
      "Cơ sở vật chất phòng Lab hiện đại, tài liệu học thuật chuyên sâu và cập nhật công nghệ thế giới.",
      "Được trao quyền chủ động nghiên cứu và phát triển giải pháp kiến trúc thay vì học vẹt quy trình.",
    ],
    strengths: ["Thiết kế hệ thống", "Tư duy phản biện", "Chiến lược dài hạn", "Tối ưu hóa quy trình"],
    suggestedMajors: [
      {
        id: "7480201",
        name: "Công nghệ thông tin",
        code: "7480201",
        faculty: "Khoa Công nghệ Thông tin",
        matchReason: "Phù hợp hoàn hảo với khả năng tư duy giải thuật, thiết kế kiến trúc phần mềm và trí tuệ nhân tạo.",
        tag: "Khớp 98%",
      },
      {
        id: "7520216",
        name: "Kỹ thuật điều khiển và Tự động hóa",
        code: "7520216",
        faculty: "Khoa Điện - Điện tử",
        matchReason: "Khả năng xây dựng hệ thống tự động, robot công nghiệp và xử lý tín hiệu điều khiển chính xác.",
        tag: "Khớp 95%",
      },
      {
        id: "7580205",
        name: "Kỹ thuật Xây dựng Công trình Giao thông",
        code: "7580205",
        faculty: "Khoa Công trình",
        matchReason: "Quy hoạch và thiết kế các đại công trình cầu đường, đường sắt đô thị và hạ tầng giao thông trọng điểm.",
        tag: "Khớp 92%",
      },
    ],
  },

  INTP: {
    type: "INTP",
    name: "Nhà Tư Duy / Nhà Khoa Học Logic",
    role: "Thinker / Logician",
    summary:
      "Đam mê tìm hiểu nguyên lý cốt lõi, thích mổ xẻ các lý thuyết trừu tượng và say mê sáng tạo ra những giải pháp công nghệ mang tính đột phá.",
    traits: [
      "Tò mò trí tuệ vô tận, luôn đặt câu hỏi 'Tại sao'",
      "Tư duy logic sắc sảo, phát hiện nhanh lỗi sai hệ thống",
      "Không thích khuôn mẫu gò bó, linh hoạt trong giải thuật",
      "Thích làm việc với dữ liệu số và mô hình toán học",
    ],
    learningEnvironment: [
      "Môi trường học tập cởi mở, khuyến khích tranh luận học thuật và phản biện logic.",
      "Không gian nghiên cứu độc lập, phòng thực hành máy tính và thiết bị đo lường hiện đại.",
      "Các đồ án sáng tạo mang tính khai phá công nghệ mới (AI, Big Data, IoT).",
    ],
    strengths: ["Phân tích nguyên lý", "Tư duy trừu tượng", "Sáng tạo giải thuật", "Khách quan"],
    suggestedMajors: [
      {
        id: "7480201",
        name: "Công nghệ thông tin (Khoa học máy tính & AI)",
        code: "7480201",
        faculty: "Khoa Công nghệ Thông tin",
        matchReason: "Thỏa sức khám phá thuật toán học máy, thị giác máy tính và cấu trúc dữ liệu giải thuật nâng cao.",
        tag: "Khớp 97%",
      },
      {
        id: "7520207",
        name: "Kỹ thuật Điện tử - Viễn thông",
        code: "7520207",
        faculty: "Khoa Điện - Điện tử",
        matchReason: "Nghiên cứu nguyên lý vi mạch, truyền dẫn vi sóng vệ tinh và hệ thống mạng IoT thế hệ mới.",
        tag: "Khớp 94%",
      },
      {
        id: "7480104",
        name: "Hệ thống thông tin",
        code: "7480104",
        faculty: "Khoa Công nghệ Thông tin",
        matchReason: "Mô hình hóa dữ liệu doanh nghiệp và xây dựng cơ sở dữ liệu lớn phân tích thông minh.",
        tag: "Khớp 91%",
      },
    ],
  },

  ENTJ: {
    type: "ENTJ",
    name: "Nhà Điều Hành / Nhà Lãnh Đạo Tiên Phong",
    role: "Commander / Executive",
    summary:
      "Tố chất lãnh đạo bẩm sinh, tư duy quản lý vĩ mô, quyết đoán và có khả năng tập hợp đội ngũ để hiện thực hóa các dự án quy mô lớn.",
    traits: [
      "Kỹ năng tổ chức, quản lý nguồn lực và ra quyết định dứt khoát",
      "Định hướng mục tiêu rõ ràng và hướng tới hiệu suất cao nhất",
      "Giao tiếp lôi cuốn, có tầm nhìn thương mại và kỹ thuật",
      "Thích ứng nhanh với áp lực công việc và sự biến động",
    ],
    learningEnvironment: [
      "Môi trường học tập sôi nổi, kết hợp chặt chẽ giữa kiến thức kỹ thuật và quản trị chuỗi cung ứng/kinh doanh.",
      "Nhiều cơ hội tham gia thuyết trình, dẫn dắt câu lạc bộ, cuộc thi khởi nghiệp và thực tập dự án thực tế.",
      "Tương tác thường xuyên với các doanh nghiệp, hiệp hội nghề nghiệp và chuyên gia đầu ngành.",
    ],
    strengths: ["Lãnh đạo dự án", "Tổ chức chiến lược", "Đàm phán & thuyết phục", "Quản lý rủi ro"],
    suggestedMajors: [
      {
        id: "7510605",
        name: "Logistics và Quản lý Chuỗi Cung Ứng",
        code: "7510605",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Tối ưu hóa mạng lưới vận tải quốc tế, điều hành kho bãi và chuỗi cung ứng toàn cầu chuyên nghiệp.",
        tag: "Khớp 98%",
      },
      {
        id: "7580302",
        name: "Quản lý Xây dựng & Đô thị",
        code: "7580302",
        faculty: "Khoa Công trình",
        matchReason: "Điều hành quản lý dự án xây dựng hạ tầng, đấu thầu và tiến độ thi công các công trình trọng điểm.",
        tag: "Khớp 95%",
      },
      {
        id: "7340101",
        name: "Quản trị Kinh doanh",
        code: "7340101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Xây dựng chiến lược doanh nghiệp, phát triển thị trường và điều hành tổ chức doanh nghiệp hiện đại.",
        tag: "Khớp 92%",
      },
    ],
  },

  ENTP: {
    type: "ENTP",
    name: "Nhà Phát Minh / Người Khởi Xướng Đổi Mới",
    role: "Visionary / Innovator",
    summary:
      "Nhanh nhạy, giàu ý tưởng sáng tạo, thích đón nhận thử thách mới và luôn tìm kiếm cách tiếp cận phi truyền thống cho mọi bài toán kỹ thuật.",
    traits: [
      "Tư duy linh hoạt, thích nghi nhanh với công nghệ mới",
      "Đam mê tranh luận, cải tiến và thử nghiệm cái mới",
      "Khả năng kết nối liên ngành giữa kỹ thuật và kinh tế",
      "Năng lượng sáng tạo cao, không ngại đột phá lối mòn",
    ],
    learningEnvironment: [
      "Môi trường năng động, linh hoạt, nhiều hoạt động Hackathon và không gian sáng tạo Maker Space.",
      "Được tự do thử nghiệm các ý tưởng công nghệ mới, thiết kế prototype và kiểm thử thực tế.",
      "Học tập qua dự án liên ngành, kết hợp trí tuệ nhân tạo, thiết bị cơ điện tử và kinh tế số.",
    ],
    strengths: ["Đổi mới sáng tạo", "Giải quyết vấn đề linh hoạt", "Thuyết phục", "Tư duy khởi nghiệp"],
    suggestedMajors: [
      {
        id: "7520114",
        name: "Kỹ thuật Cơ điện tử (Mechatronics & Robotics)",
        code: "7520114",
        faculty: "Khoa Cơ khí",
        matchReason: "Kết hợp cơ khí, điện tử và lập trình nhúng để sáng tạo ra robot thông minh và thiết bị tự hành.",
        tag: "Khớp 96%",
      },
      {
        id: "7480201",
        name: "Công nghệ thông tin",
        code: "7480201",
        faculty: "Khoa Công nghệ Thông tin",
        matchReason: "Phát triển các ứng dụng di động, giải pháp đám mây và nền tảng công nghệ số đột phá.",
        tag: "Khớp 94%",
      },
      {
        id: "7520130",
        name: "Kỹ thuật Ô tô (Ô tô Điện & Xe Tự Hành)",
        code: "7520130",
        faculty: "Khoa Cơ khí",
        matchReason: "Đón đầu xu hướng chuyển dịch năng lượng xanh, xe điện thông minh và hệ thống hỗ trợ lái ADAS.",
        tag: "Khớp 93%",
      },
    ],
  },

  ISTJ: {
    type: "ISTJ",
    name: "Nhà Thẩm Định / Kỹ Sư Nguyên Tắc & Tận Tụy",
    role: "Inspector / Realist",
    summary:
      "Cẩn trọng, nguyên tắc, tôn trọng quy chuẩn an toàn kỹ thuật tuyệt đối và kiên trì hoàn thành mọi nhiệm vụ với độ chính xác cao.",
    traits: [
      "Trách nhiệm cao, tuân thủ nghiêm ngặt quy trình kỹ thuật",
      "Cẩn thận, chú trọng từng chi tiết kỹ thuật nhỏ",
      "Thực tế, đáng tin cậy trong các công việc cần sự bền bỉ",
      "Yêu thích tính ổn định, rõ ràng và có căn cứ pháp lý",
    ],
    learningEnvironment: [
      "Môi trường học tập quy chuẩn, giáo trình minh bạch, quy định an toàn lao động nghiêm ngặt.",
      "Hệ thống phòng thí nghiệm kiểm định chất lượng, thực hành khảo sát đo đạc thực tế tại hiện trường.",
      "Chương trình đào tạo kỹ sư theo chuẩn kiểm định quốc tế (ABET / AUN-QA).",
    ],
    strengths: ["Kỷ luật kỹ thuật", "Kiểm soát chất lượng", "Độ chính xác cao", "Độ tin cậy"],
    suggestedMajors: [
      {
        id: "7580201",
        name: "Kỹ thuật Xây dựng (Dân dụng & Công nghiệp)",
        code: "7580201",
        faculty: "Khoa Công trình",
        matchReason: "Tính toán kết cấu, an toàn chịu lực công trình và giám sát thi công theo đúng quy chuẩn nghiêm ngặt.",
        tag: "Khớp 97%",
      },
      {
        id: "7340301",
        name: "Kế toán",
        code: "7340301",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Quản lý dòng tiền, kiểm toán tài chính và lập báo cáo thuế chính xác tuyệt đối theo pháp luật.",
        tag: "Khớp 95%",
      },
      {
        id: "7520117",
        name: "Kỹ thuật Cơ khí Giao thông",
        code: "7520117",
        faculty: "Khoa Cơ khí",
        matchReason: "Chế tạo, bảo trì và kiểm định an toàn phương tiện đường sắt, toa xe và máy móc công trình.",
        tag: "Khớp 92%",
      },
    ],
  },

  ISFJ: {
    type: "ISFJ",
    name: "Người Bảo Hộ / Kỹ Sư Tận Tâm & Chu Đáo",
    role: "Protector / Defender",
    summary:
      "Tận tâm, chu đáo, có tinh thần phụng sự cộng đồng cao và luôn đảm bảo sự an toàn, tiện nghi tối đa cho người sử dụng công trình và dịch vụ.",
    traits: [
      "Lắng nghe, thấu hiểu và quan tâm tới nhu cầu con người",
      "Tỉ mỉ, kiên nhẫn và có tinh thần trách nhiệm tập thể",
      "Tôn trọng truyền thống, gìn giữ văn hóa tổ chức",
      "Làm việc thầm lặng nhưng đóng góp nền tảng to lớn",
    ],
    learningEnvironment: [
      "Môi trường học tập ấm cúng, tinh thần đồng đội cao, thầy cô và bạn bè thân thiện hỗ trợ nhau.",
      "Gắn liền với các dự án phục vụ cộng đồng, giao thông công cộng thân thiện môi trường.",
      "Được thực tập tại các đơn vị vận tải công ích, ban quản lý dự án nhà nước.",
    ],
    strengths: ["Tận tâm chu đáo", "Chăm sóc khách hàng", "Kiên nhẫn", "Tổ chức chi tiết"],
    suggestedMajors: [
      {
        id: "7840101",
        name: "Khai thác Vận tải (Quản lý Vận tải Đô thị)",
        code: "7840101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Tổ chức điều hành mạng lưới xe buýt, metro văn minh, phục vụ an toàn nhu cầu đi lại của nhân dân.",
        tag: "Khớp 96%",
      },
      {
        id: "7510401",
        name: "Kỹ thuật Môi trường",
        code: "7510401",
        faculty: "Khoa Môi trường & An toàn Giao thông",
        matchReason: "Xử lý nước thải, kiểm soát khí thải giao thông và bảo vệ lá phổi xanh cho các đô thị hiện đại.",
        tag: "Khớp 93%",
      },
      {
        id: "7340201",
        name: "Tài chính - Ngân hàng",
        code: "7340201",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Quản lý thẩm định tín dụng, bảo hiểm an toàn và hỗ trợ tài chính ổn định cho khách hàng.",
        tag: "Khớp 90%",
      },
    ],
  },

  ESTJ: {
    type: "ESTJ",
    name: "Người Quản Lý / Chỉ Huy Công Trường Quyết Đoán",
    role: "Supervisor / Director",
    summary:
      "Thực tế, quyết liệt, giỏi tổ chức nhân sự hiện trường và quản lý tiến độ các dự án kỹ thuật hạ tầng quy mô lớn.",
    traits: [
      "Khả năng ra lệnh, phân công công việc rõ ràng và mạch lạc",
      "Cam kết đúng tiến độ (Deadline), chất lượng và ngân sách",
      "Trung thực, thẳng thắn và tôn trọng thứ bậc kỷ luật",
      "Xử lý khủng hoảng tại hiện trường nhanh chóng, vững vàng",
    ],
    learningEnvironment: [
      "Môi trường học tập kỷ luật cao, gắn chặt với công trường xây dựng thực tế và xưởng chế tạo.",
      "Nhiều môn học thực hành trắc địa, chỉ huy nổ mìn, quản lý máy xây dựng và tổ chức thi công.",
      "Được rèn luyện tác phong chỉ huy của một chỉ huy trưởng công trình tương lai.",
    ],
    strengths: ["Chỉ huy công trường", "Quản lý tiến độ", "Kỷ luật nghiêm minh", "Quyết đoán"],
    suggestedMajors: [
      {
        id: "7580205",
        name: "Kỹ thuật Xây dựng Công trình Giao thông (Cầu - Đường bộ)",
        code: "7580205",
        faculty: "Khoa Công trình",
        matchReason: "Trở thành chỉ huy trưởng các dự án cao tốc Bắc Nam, cầu dây văng lớn và tuyến metro huyết mạch.",
        tag: "Khớp 98%",
      },
      {
        id: "7510605",
        name: "Logistics và Quản lý Chuỗi Cung Ứng",
        code: "7510605",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Điều hành hoạt động cảng biển, trung tâm tiếp vận hàng hóa và đội xe vận chuyển liên tỉnh.",
        tag: "Khớp 94%",
      },
      {
        id: "7520115",
        name: "Kỹ thuật Nhiệt (Nhiệt điện & Điện lạnh công nghiệp)",
        code: "7520115",
        faculty: "Khoa Cơ khí",
        matchReason: "Vận hành hệ thống điều hòa trung tâm tòa nhà cao tầng và các trạm biến áp, nhà máy nhiệt điện.",
        tag: "Khớp 91%",
      },
    ],
  },

  ESFJ: {
    type: "ESFJ",
    name: "Người Cung Cấp / Chuyên Gia Hợp Tác & Kết Nối",
    role: "Provider / Caregiver",
    summary:
      "Ấm áp, hòa đồng, xuất sắc trong làm việc với con người, điều phối nhân sự và xây dựng môi trường tập thể gắn kết.",
    traits: [
      "Trực giác xã hội cao, tạo dựng niềm tin nhanh chóng",
      "Kỹ năng lắng nghe, đồng cảm và giải quyết xung đột tốt",
      "Có tinh thần trách nhiệm cao với đồng đội",
      "Thích các hoạt động phong trào, sự kiện và đối ngoại",
    ],
    learningEnvironment: [
      "Môi trường tập thể sôi nổi, đoàn hội năng động, nhiều hoạt động tình nguyện và câu lạc bộ sinh viên.",
      "Học tập theo nhóm (Teamwork), thực hành giao tiếp kinh doanh và chăm sóc khách hàng doanh nghiệp.",
      "Liên kết sâu rộng với các đối tác tuyển dụng, ngày hội việc làm và giao lưu quốc tế.",
    ],
    strengths: ["Giao tiếp kết nối", "Chăm sóc quan hệ đối tác", "Tổ chức sự kiện", "Hòa giải xung đột"],
    suggestedMajors: [
      {
        id: "7340101",
        name: "Quản trị Kinh doanh (Marketing & Truyền thông)",
        code: "7340101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Phát triển thương hiệu, xây dựng chiến dịch truyền thông và chăm sóc khách hàng chuyên nghiệp.",
        tag: "Khớp 96%",
      },
      {
        id: "7310101",
        name: "Kinh tế (Kinh tế Xây dựng & Giao thông)",
        code: "7310101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Phân tích hiệu quả kinh tế - xã hội của dự án và làm việc cùng các cơ quan ban ngành đầu tư.",
        tag: "Khớp 93%",
      },
      {
        id: "7840101",
        name: "Khai thác Vận tải",
        code: "7840101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Điều hành dịch vụ vận chuyển hành khách du lịch, hàng không và dịch vụ đường sắt cao cấp.",
        tag: "Khớp 90%",
      },
    ],
  },

  ISTP: {
    type: "ISTP",
    name: "Nhà Kỹ Thuật Thực Tế / Bậc Thầy Sửa Chữa Cơ Điện",
    role: "Crafter / Virtuoso",
    summary:
      "Tư duy thực hành vượt trội, thích tháo lắp máy móc cơ khí, làm chủ các công cụ kỹ thuật và giải quyết sự cố thực địa cực nhanh.",
    traits: [
      "Học qua thực hành 'Hands-on', thạo thao tác máy móc",
      "Bình tĩnh trước các sự cố kỹ thuật hóc búa",
      "Yêu thích sự tự do, không thích lý thuyết suông rườm rà",
      "Khả năng quan sát tinh tế về cơ chế vận hành vật lý",
    ],
    learningEnvironment: [
      "Xưởng cơ khí, phòng thực hành máy CNC, bãi thử nghiệm ô tô và đường ray thực tế.",
      "Học bằng cách trực tiếp chế tạo, lập trình vi điều khiển, tháo lắp động cơ xe và hàn cắt kỹ thuật.",
      "Được khuyến khích tham gia cuộc thi Chế tạo xe tiết kiệm nhiên liệu Eco Mileage, Robocon UTC.",
    ],
    strengths: ["Sửa chữa cơ khí", "Xử lý sự cố tại chỗ", "Làm chủ công cụ", "Bình tĩnh trước áp lực"],
    suggestedMajors: [
      {
        id: "7520130",
        name: "Kỹ thuật Ô tô",
        code: "7520130",
        faculty: "Khoa Cơ khí",
        matchReason: "Chẩn đoán bệnh ô tô hiện đại, độ xe, tinh chỉnh động cơ và thử nghiệm an toàn xe cơ giới.",
        tag: "Khớp 98%",
      },
      {
        id: "7520103",
        name: "Kỹ thuật Cơ khí",
        code: "7520103",
        faculty: "Khoa Cơ khí",
        matchReason: "Gia công chế tạo máy công cụ, công nghệ đúc hàn và thiết kế chi tiết máy trên phần mềm CAD/CAM.",
        tag: "Khớp 95%",
      },
      {
        id: "7520216",
        name: "Kỹ thuật Điều khiển và Tự động hóa",
        code: "7520216",
        faculty: "Khoa Điện - Điện tử",
        matchReason: "Lập trình PLC, lắp ráp tủ điện công nghiệp và đấu nối cảm biến cho dây chuyền sản xuất tự động.",
        tag: "Khớp 92%",
      },
    ],
  },

  ISFP: {
    type: "ISFP",
    name: "Người Nghệ Sĩ / Nhà Thiết Kế Không Gian & Cảnh Quan",
    role: "Artist / Composer",
    summary:
      "Cảm thụ thẩm mỹ tinh tế, hòa hợp giữa vẻ đẹp nghệ thuật và công năng kỹ thuật hạ tầng, luôn mong muốn làm đẹp không gian sống con người.",
    traits: [
      "Óc quan sát thẩm mỹ, cảm thụ không gian và màu sắc tốt",
      "Linh hoạt, sống hết mình với hiện tại và tự do sáng tạo",
      "Nhạy cảm với môi trường sống và trải nghiệm người dùng",
      "Khiêm tốn, thích thể hiện qua tác phẩm thiết kế hơn lời nói",
    ],
    learningEnvironment: [
      "Studio đồ án thiết kế kiến trúc, xưởng mô hình, không gian triển lãm đồ án sinh viên.",
      "Các chuyến đi thực tế khảo sát kiến trúc cổ, công trình cầu biểu tượng và cảnh quan đô thị.",
      "Tự do sáng tác trên các phần mềm đồ họa 3D, dựng hình Revit, SketchUp và Lumion.",
    ],
    strengths: ["Cảm thụ không gian", "Thiết kế thẩm mỹ", "Tỉ mỉ sáng tạo", "Linh hoạt"],
    suggestedMajors: [
      {
        id: "7580101",
        name: "Kiến trúc",
        code: "7580101",
        faculty: "Khoa Công trình",
        matchReason: "Sáng tạo không gian nhà ở, cảnh quan đô thị và công trình nhà ga giao thông hiện đại giàu tính biểu tượng.",
        tag: "Khớp 97%",
      },
      {
        id: "7580201",
        name: "Kỹ thuật Xây dựng (Thiết kế Nội thất & Công trình)",
        code: "7580201",
        faculty: "Khoa Công trình",
        matchReason: "Kết hợp giữa kết cấu kỹ thuật an toàn và vẻ đẹp trang trí hoàn thiện không gian sống văn minh.",
        tag: "Khớp 92%",
      },
      {
        id: "7510401",
        name: "Kỹ thuật Môi trường",
        code: "7510401",
        faculty: "Khoa Môi trường & An toàn Giao thông",
        matchReason: "Kiến tạo cảnh quan sinh thái bền vững, bảo vệ công viên cây xanh và hồ nước đô thị.",
        tag: "Khớp 89%",
      },
    ],
  },

  ESTP: {
    type: "ESTP",
    name: "Nhà Khảo Sát Năng Động / Người Giải Quyết Thực Địa Siêu Tốc",
    role: "Dynamo / Entrepreneur",
    summary:
      "Năng lượng bùng nổ, phản xạ nhanh nhạy, thích hành động trực tiếp ngoài công trường và đàm phán hợp đồng thương mại xuất sắc.",
    traits: [
      "Thích hành động ngay thay vì ngồi phân tích lý thuyết dài",
      "Thích nghi cực nhanh với hiện trường khắc nghiệt",
      "Dũng cảm, dám chấp nhận rủi ro kỹ thuật có tính toán",
      "Khả năng đọc vị tình huống và thuyết phục đối tác nhanh",
    ],
    learningEnvironment: [
      "Công trường xây dựng lớn, các chuyến đi thực địa đo đạc xuyên rừng núi, công trình vượt sông biển.",
      "Môi trường cạnh tranh lành mạnh, nhiều giải đấu thể thao, hội thao kỹ thuật sinh viên UTC.",
      "Gắn liền với các kỳ thực tập công nhân tại các tổng công ty xây dựng và vận tải lớn.",
    ],
    strengths: ["Ứng biến hiện trường", "Đàm phán nhanh", "Hành động thực tế", "Năng lượng cao"],
    suggestedMajors: [
      {
        id: "7580205",
        name: "Kỹ thuật Xây dựng Công trình Giao thông",
        code: "7580205",
        faculty: "Khoa Công trình",
        matchReason: "Chỉ huy máy xúc máy ủi, đổ bê tông bản mặt cầu và thông hầm xuyên núi trên các đại công trường kỳ vĩ.",
        tag: "Khớp 96%",
      },
      {
        id: "7510605",
        name: "Logistics và Quản lý Chuỗi Cung Ứng",
        code: "7510605",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Xử lý thủ tục hải quan tại cảng biển, đàm phán cước tàu bay quốc tế và ứng cứu chuỗi cung ứng.",
        tag: "Khớp 94%",
      },
      {
        id: "7520130",
        name: "Kỹ thuật Ô tô",
        code: "7520130",
        faculty: "Khoa Cơ khí",
        matchReason: "Trở thành chuyên viên dịch vụ kỹ thuật cao cấp, quản lý xưởng dịch vụ đại lý xe hơi danh tiếng.",
        tag: "Khớp 91%",
      },
    ],
  },

  ESFP: {
    type: "ESFP",
    name: "Người Trình Diễn / Đại Sứ Thương Hiệu & Sự Kiện",
    role: "Performer / Entertainer",
    summary:
      "Tràn đầy nhiệt huyết, hướng ngoại, mang lại năng lượng tích cực cho mọi người và làm cầu nối truyền thông tuyệt vời cho tổ chức.",
    traits: [
      "Duyên dáng, cởi mở và giao tiếp trước đám đông tự tin",
      "Nắm bắt tâm lý khách hàng nhanh nhạy",
      "Thích môi trường vui tươi, sôi động và đổi mới mỗi ngày",
      "Sẵn sàng thử nghiệm những hình thức truyền thông mới lạ",
    ],
    learningEnvironment: [
      "Môi trường sinh viên năng động, phong trào Đoàn - Hội rực rỡ cờ hoa, câu lạc bộ âm nhạc, MC, sự kiện.",
      "Nhiều môn học về kỹ năng mềm, thuyết trình dự án, marketing đa kênh và quan hệ công chúng.",
      "Cơ hội làm đại sứ hình ảnh cho trường trong các mùa tư vấn tuyển sinh và giao lưu quốc tế.",
    ],
    strengths: ["Truyền cảm hứng", "Giao tiếp công chúng", "Nhiệt huyết", "Thích ứng xã hội"],
    suggestedMajors: [
      {
        id: "7340101",
        name: "Quản trị Kinh doanh",
        code: "7340101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Tổ chức sự kiện thương mại, quản lý bán hàng và truyền thông thương hiệu dịch vụ vận tải.",
        tag: "Khớp 96%",
      },
      {
        id: "7840101",
        name: "Khai thác Vận tải (Dịch vụ Du lịch & Hàng không)",
        code: "7840101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Phục vụ hành khách cao cấp, tổ chức tour du lịch lữ hành và điều hành dịch vụ mặt đất sân bay.",
        tag: "Khớp 93%",
      },
      {
        id: "7310101",
        name: "Kinh tế",
        code: "7310101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Xúc tiến thương mại, nghiên cứu hành vi người tiêu dùng và phân tích thị trường kinh tế số.",
        tag: "Khớp 89%",
      },
    ],
  },

  INFJ: {
    type: "INFJ",
    name: "Người Cố Vấn / Nhà Quy Hoạch Nhân Văn & Tầm Nhìn",
    role: "Advocate / Counselor",
    summary:
      "Tầm nhìn sâu sắc, giàu lòng trắc ẩn, luôn suy nghĩ về sự phát triển bền vững và mong muốn đem kỹ thuật phục vụ tương lai hạnh phúc của con người.",
    traits: [
      "Trực giác sâu sắc, nhìn thấu xu hướng dài hạn",
      "Lý tưởng sống cao đẹp, cam kết với sứ mệnh xã hội",
      "Lắng nghe và thấu cảm tuyệt vời với con người",
      "Làm việc thầm lặng nhưng có sức lan tỏa mạnh mẽ",
    ],
    learningEnvironment: [
      "Không gian học tập yên tĩnh, học thuật hàn lâm, nhiều sách chuyên khảo và tài liệu nghiên cứu quy hoạch.",
      "Được thảo luận về phát triển đô thị xanh bền vững, giảm thiểu khí nhà kính và công bằng xã hội.",
      "Tham gia các đề tài nghiên cứu khoa học cùng các Giáo sư, Tiến sĩ hàng đầu của trường.",
    ],
    strengths: ["Tầm nhìn quy hoạch", "Tư duy nhân văn", "Truyền cảm hứng thầm lặng", "Chiến lược bền vững"],
    suggestedMajors: [
      {
        id: "7580302",
        name: "Quản lý Xây dựng & Đô thị",
        code: "7580302",
        faculty: "Khoa Công trình",
        matchReason: "Quy hoạch không gian đô thị thông minh, đảm bảo sự phát triển hài hòa giữa con người và thiên nhiên.",
        tag: "Khớp 96%",
      },
      {
        id: "7510401",
        name: "Kỹ thuật Môi trường",
        code: "7510401",
        faculty: "Khoa Môi trường & An toàn Giao thông",
        matchReason: "Nghiên cứu công nghệ xử lý ô nhiễm, kinh tế tuần hoàn và bảo tồn tài nguyên cho thế hệ mai sau.",
        tag: "Khớp 94%",
      },
      {
        id: "7480104",
        name: "Hệ thống thông tin",
        code: "7480104",
        faculty: "Khoa Công nghệ Thông tin",
        matchReason: "Thiết kế hệ thống thông tin phục vụ quản lý y tế, giáo dục và giao thông công cộng thông minh.",
        tag: "Khớp 91%",
      },
    ],
  },

  INFP: {
    type: "INFP",
    name: "Người Hòa Giải / Nhà Sáng Tạo Lý Tưởng & Tự Do",
    role: "Mediator / Healer",
    summary:
      "Giàu cảm xúc, trân trọng các giá trị chân - thiện - mỹ, có khả năng tư duy sáng tạo độc đáo và hướng tới môi trường học tập tự do, truyền cảm hứng.",
    traits: [
      "Độc lập trong suy nghĩ, bảo vệ mạnh mẽ giá trị đạo đức cá nhân",
      "Giàu trí tưởng tượng và sáng tạo phong phú",
      "Cởi mở với các góc nhìn khác biệt, không định kiến",
      "Tận tâm khi công việc có ý nghĩa phục vụ cộng đồng",
    ],
    learningEnvironment: [
      "Môi trường học tập tôn trọng sự khác biệt cá nhân, không gò ép tư duy rập khuôn.",
      "Nhiều không gian đọc sách, cà phê học bài, các câu lạc bộ nghệ thuật và dự án phi chính phủ.",
      "Được khuyến khích thể hiện cái tôi sáng tạo qua các bài tiểu luận, đồ án kiến trúc cảnh quan.",
    ],
    strengths: ["Sáng tạo nguyên bản", "Thấu cảm sâu sắc", "Tận tụy với lý tưởng", "Tư duy mở"],
    suggestedMajors: [
      {
        id: "7580101",
        name: "Kiến trúc",
        code: "7580101",
        faculty: "Khoa Công trình",
        matchReason: "Thổi hồn nghệ thuật và cảm xúc vào từng công trình kiến trúc, mang lại bình yên cho con người.",
        tag: "Khớp 96%",
      },
      {
        id: "7340101",
        name: "Quản trị Kinh doanh",
        code: "7340101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Phát triển các doanh nghiệp xã hội, sản phẩm dịch vụ nhân văn và bảo vệ môi trường.",
        tag: "Khớp 90%",
      },
      {
        id: "7510401",
        name: "Kỹ thuật Môi trường",
        code: "7510401",
        faculty: "Khoa Môi trường & An toàn Giao thông",
        matchReason: "Bảo vệ hệ sinh thái rừng ngập mặn, sông ngòi và đa dạng sinh học trước áp lực đô thị hóa.",
        tag: "Khớp 89%",
      },
    ],
  },

  ENFJ: {
    type: "ENFJ",
    name: "Người Khai Sáng / Nhà Lãnh Đạo Truyền Cảm Hứng",
    role: "Protagonist / Teacher",
    summary:
      "Nhiệt huyết, truyền cảm hứng mạnh mẽ, giỏi kết nối mọi người xung quanh cùng chung sức thực hiện những mục tiêu kỹ thuật - kinh tế cao đẹp.",
    traits: [
      "Lôi cuốn, có tài năng diễn thuyết và thuyết phục tự nhiên",
      "Nhìn thấy tiềm năng phát triển của người khác và nâng đỡ họ",
      "Tổ chức công việc khoa học, cân bằng giữa lý trí và tình cảm",
      "Được tập thể yêu mến và tin cậy giao phó trọng trách",
    ],
    learningEnvironment: [
      "Môi trường giáo dục tiên tiến, giàu tính tương tác giữa giảng viên và sinh viên.",
      "Nhiều vị trí ban cán sự lớp, chủ nhiệm câu lạc bộ sinh viên, trợ giảng và ban tổ chức sự kiện khoa.",
      "Các khóa đào tạo kỹ năng lãnh đạo, quản trị nhân sự và làm việc trong môi trường đa văn hóa.",
    ],
    strengths: ["Truyền cảm hứng", "Lãnh đạo đồng thuận", "Giao tiếp xuất sắc", "Phát triển nhân sự"],
    suggestedMajors: [
      {
        id: "7340101",
        name: "Quản trị Kinh doanh (Quản trị Nhân lực & Dự án)",
        code: "7340101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Xây dựng đội ngũ nhân sự gắn kết, văn hóa doanh nghiệp vững mạnh và điều hành tổ chức hiệu quả.",
        tag: "Khớp 97%",
      },
      {
        id: "7580302",
        name: "Quản lý Xây dựng & Đô thị",
        code: "7580302",
        faculty: "Khoa Công trình",
        matchReason: "Điều phối các bên liên quan (chủ đầu tư, nhà thầu, người dân) để dự án hạ tầng về đích thành công.",
        tag: "Khớp 94%",
      },
      {
        id: "7510605",
        name: "Logistics và Quản lý Chuỗi Cung Ứng",
        code: "7510605",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Lãnh đạo các trung tâm điều vận đa quốc gia, thúc đẩy kết nối chuỗi cung ứng xanh và bền vững.",
        tag: "Khớp 92%",
      },
    ],
  },

  ENFP: {
    type: "ENFP",
    name: "Người Truyền Cảm Hứng / Nhà Sáng Tạo Năng Động",
    role: "Campaigner / Champion",
    summary:
      "Tâm hồn tự do, giàu nhiệt huyết, tràn ngập ý tưởng sáng tạo và luôn kết nối con người với công nghệ bằng năng lượng tích cực.",
    traits: [
      "Trực giác nhạy bén, nhận ra cơ hội mới từ những điều bình thường",
      "Dễ mến, giàu năng lượng và lan tỏa cảm hứng cho tập thể",
      "Thích ứng siêu nhanh, không ngại thay đổi để tốt hơn",
      "Đam mê kết nối mạng lưới bạn bè và đối tác",
    ],
    learningEnvironment: [
      "Không gian làm việc chung (Co-working space), cộng đồng sinh viên khởi nghiệp đổi mới sáng tạo.",
      "Tham gia các hội thảo quốc tế, chương trình trao đổi sinh viên (Exchange program) với các trường đại học nước ngoài.",
      "Phương pháp học tập đảo ngược (Flipped Classroom), thảo luận mở không gò bó giáo điều.",
    ],
    strengths: ["Ý tưởng đột phá", "Giao tiếp lôi cuốn", "Kết nối cộng đồng", "Linh hoạt thích ứng"],
    suggestedMajors: [
      {
        id: "7340101",
        name: "Quản trị Kinh doanh (Thương mại điện tử & Khởi nghiệp)",
        code: "7340101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Sáng lập các dự án khởi nghiệp công nghệ, kinh doanh trực tuyến và tiếp thị kỹ thuật số.",
        tag: "Khớp 97%",
      },
      {
        id: "7480201",
        name: "Công nghệ thông tin (Thiết kế Giao diện UI/UX & Web)",
        code: "7480201",
        faculty: "Khoa Công nghệ Thông tin",
        matchReason: "Sáng tạo trải nghiệm người dùng tuyệt vời, thiết kế sản phẩm số chạm đến cảm xúc người dùng.",
        tag: "Khớp 93%",
      },
      {
        id: "7840101",
        name: "Khai thác Vận tải (Quản lý Vận tải Hàng không)",
        code: "7840101",
        faculty: "Khoa Vận tải - Kinh tế",
        matchReason: "Môi trường quốc tế hiện đại, làm việc với các hãng hàng không và điều hành chuyến bay toàn cầu.",
        tag: "Khớp 91%",
      },
    ],
  },
};

export interface MbtiQuestion {
  id: number;
  text: string;
  dimension: "EI" | "SN" | "TF" | "JP";
  direction: 1 | -1; // 1: ủng hộ E/S/T/J, -1: ủng hộ I/N/F/P
}

export const MBTI_QUESTIONS: MbtiQuestion[] = [
  // E vs I (4 câu)
  {
    id: 1,
    dimension: "EI",
    direction: 1,
    text: "Sau một tuần học tập căng thẳng, bạn thích tụ tập giao lưu bạn bè hơn là ở một mình trong phòng riêng?",
  },
  {
    id: 2,
    dimension: "EI",
    direction: -1,
    text: "Bạn cảm thấy làm việc độc lập trong không gian yên tĩnh giúp bạn tập trung và đạt hiệu suất cao nhất?",
  },
  {
    id: 3,
    dimension: "EI",
    direction: 1,
    text: "Bạn dễ dàng bắt chuyện và làm quen với những người bạn mới ngay trong buổi sinh hoạt đầu tiên?",
  },
  {
    id: 4,
    dimension: "EI",
    direction: -1,
    text: "Bạn thích chia sẻ suy nghĩ của mình qua bài viết hoặc tin nhắn hơn là nói chuyện trực tiếp trước đám đông?",
  },

  // S vs N (4 câu)
  {
    id: 5,
    dimension: "SN",
    direction: 1,
    text: "Khi học kỹ thuật, bạn thích quan sát các máy móc, hiện vật cụ thể hơn là ngồi nghe các lý thuyết trừu tượng?",
  },
  {
    id: 6,
    dimension: "SN",
    direction: -1,
    text: "Bạn thường tò mò về xu hướng công nghệ tương lai và khả năng ứng dụng của trí tuệ nhân tạo (AI)?",
  },
  {
    id: 7,
    dimension: "SN",
    direction: 1,
    text: "Bạn luôn chú ý đến từng con số, chi tiết thông số kỹ thuật thực tế thay vì bức tranh tổng thể mơ hồ?",
  },
  {
    id: 8,
    dimension: "SN",
    direction: -1,
    text: "Bạn thích tưởng tượng ra những cách làm hoàn toàn mới dù phương pháp truyền thống vẫn đang chạy tốt?",
  },

  // T vs F (4 câu)
  {
    id: 9,
    dimension: "TF",
    direction: 1,
    text: "Khi giải quyết xung đột trong nhóm, bạn ưu tiên tính công bằng, logic và sự thật hơn là cảm xúc cá nhân?",
  },
  {
    id: 10,
    dimension: "TF",
    direction: -1,
    text: "Bạn dễ dàng đồng cảm với khó khăn của người khác và sẵn sàng nhân nhượng để giữ hòa khí tập thể?",
  },
  {
    id: 11,
    dimension: "TF",
    direction: 1,
    text: "Bạn tin rằng một quyết định kỹ thuật hay kinh tế đúng đắn phải dựa trên số liệu phân tích rõ ràng?",
  },
  {
    id: 12,
    dimension: "TF",
    direction: -1,
    text: "Khi đánh giá kết quả, bạn quan tâm nhiều đến sự nỗ lực và tâm huyết của người làm hơn chỉ mỗi điểm số?",
  },

  // J vs P (4 câu)
  {
    id: 13,
    dimension: "JP",
    direction: 1,
    text: "Bạn luôn lên kế hoạch chi tiết cho lịch ôn thi hoặc chuyến đi chơi từ sớm và tuân thủ đúng lộ trình?",
  },
  {
    id: 14,
    dimension: "JP",
    direction: -1,
    text: "Bạn thích làm việc theo cảm hứng, linh hoạt tùy cơ ứng biến và thường hoàn thành bài tập sát hạn chót?",
  },
  {
    id: 15,
    dimension: "JP",
    direction: 1,
    text: "Bàn học, tài liệu và các thư mục máy tính của bạn luôn được phân loại ngăn nắp, có hệ thống rõ ràng?",
  },
  {
    id: 16,
    dimension: "JP",
    direction: -1,
    text: "Bạn cảm thấy gò bó khi bị ép buộc phải làm theo các quy định cứng nhắc mà không được tự do sáng tạo?",
  },
];

export function calculateMbtiType(
  answers: Record<number, number>,
  questionsList: MbtiQuestion[] = MBTI_QUESTIONS
): {
  type: string;
  scores: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
} {
  let eScore = 0;
  let iScore = 0;
  let sScore = 0;
  let nScore = 0;
  let tScore = 0;
  let fScore = 0;
  let jScore = 0;
  let pScore = 0;

  const targetQuestions = questionsList && questionsList.length > 0 ? questionsList : MBTI_QUESTIONS;

  targetQuestions.forEach((q) => {
    const val = answers[q.id] || 3; // thang 1 đến 5 (3 là trung tính)
    const weight = val - 3; // -2, -1, 0, 1, 2

    if (q.dimension === "EI") {
      if (q.direction === 1) {
        if (weight > 0) eScore += weight;
        else if (weight < 0) iScore += Math.abs(weight);
      } else {
        if (weight > 0) iScore += weight;
        else if (weight < 0) eScore += Math.abs(weight);
      }
    } else if (q.dimension === "SN") {
      if (q.direction === 1) {
        if (weight > 0) sScore += weight;
        else if (weight < 0) nScore += Math.abs(weight);
      } else {
        if (weight > 0) nScore += weight;
        else if (weight < 0) sScore += Math.abs(weight);
      }
    } else if (q.dimension === "TF") {
      if (q.direction === 1) {
        if (weight > 0) tScore += weight;
        else if (weight < 0) fScore += Math.abs(weight);
      } else {
        if (weight > 0) fScore += weight;
        else if (weight < 0) tScore += Math.abs(weight);
      }
    } else if (q.dimension === "JP") {
      if (q.direction === 1) {
        if (weight > 0) jScore += weight;
        else if (weight < 0) pScore += Math.abs(weight);
      } else {
        if (weight > 0) pScore += weight;
        else if (weight < 0) jScore += Math.abs(weight);
      }
    }
  });

  const letter1 = eScore >= iScore ? "E" : "I";
  const letter2 = sScore >= nScore ? "S" : "N";
  const letter3 = tScore >= fScore ? "T" : "F";
  const letter4 = jScore >= pScore ? "J" : "P";

  const type = `${letter1}${letter2}${letter3}${letter4}`;

  return {
    type,
    scores: {
      E: eScore,
      I: iScore,
      S: sScore,
      N: nScore,
      T: tScore,
      F: fScore,
      J: jScore,
      P: pScore,
    },
  };
}
