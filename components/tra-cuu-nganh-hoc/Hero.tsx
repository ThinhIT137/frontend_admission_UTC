const Hero = () => {
    return (
        <div className="bg-[#fffdf7] p-6 pt-10 border-[3px] border-[#111827] shadow-[5px_5px_0px_#111827] rounded-[16px] relative">
            <div className="absolute top-3 left-6 px-3 py-0.5 bg-[#86efac] border-[2px] border-[#111827] font-stamp text-[11px] font-bold text-[#111827] uppercase rotate-[-2deg] shadow-[1px_1px_0px_#111827]">
                DỮ LIỆU ( NGÀNH)
            </div>
            <h1 className="font-display font-extrabold text-[28px] lg:text-[34px] text-[#111827] uppercase">
                TRA CỨU NGÀNH HỌC
            </h1>
            <p className="text-[14px] text-[#4b5563] font-medium mt-1">
                Tra cứu mã ngành, chỉ tiêu, tổ hợp xét tuyển và lịch sử điểm
                chuẩn của trường Đại học Giao thông Vận tải từ cơ sở dữ liệu
                thật.
            </p>
        </div>
    );
};

export default Hero;
