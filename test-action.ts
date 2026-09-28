import { getAllNganhHoc } from "./actions/nganh_hoc.action";

async function test() {
    const res = await getAllNganhHoc({
        page: 1,
        pageSize: 10,
        term: "",
        toHop: "",
        diemChuan: 0,
        faculty: "",
        year: 2026
    });
    console.log("Action returned:", res.data?.length, "records");
    if (res.data?.length === 0) {
        console.log("Why is it 0??");
    }
    process.exit(0);
}
test();
