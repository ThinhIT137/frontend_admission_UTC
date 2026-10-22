const { test, expect } = require("@playwright/test");

test("Hồ sơ: nhập học bạ nhiều kỳ, metadata chứng chỉ và giải thưởng", async ({
    page,
}) => {
    await page.goto("/nop-ho-so");
    await page
        .getByLabel("Học kỳ bảng điểm 1", { exact: true })
        .selectOption("1");
    const subject = page.getByLabel("Môn 1", { exact: true });
    const option = await subject.locator("option").nth(1).getAttribute("value");
    expect(option).toBeTruthy();
    await subject.selectOption(option);
    await page.getByLabel("Điểm môn 1", { exact: true }).fill("8.75");
    await page
        .getByRole("button", { name: "Thêm bảng điểm năm/kỳ", exact: true })
        .click();
    await page
        .getByLabel("Học kỳ bảng điểm 2", { exact: true })
        .selectOption("2");
    await page.getByLabel("Bảng 2 môn 1", { exact: true }).selectOption(option);
    await page.getByLabel("Điểm bảng 2 môn 1", { exact: true }).fill("9");
    await page
        .getByRole("button", { name: "Thêm chứng chỉ", exact: true })
        .click();
    await page.getByLabel("Loại chứng chỉ 1", { exact: true }).fill("IELTS");
    await page.getByLabel("Điểm chứng chỉ 1", { exact: true }).fill("7.0");
    await page
        .getByLabel("Ngày cấp chứng chỉ 1", { exact: true })
        .fill("2025-01-01");
    await page
        .getByLabel("Ngày hết hạn chứng chỉ 1", { exact: true })
        .fill("2027-01-01");
    await page
        .getByRole("button", { name: "Thêm giải thưởng", exact: true })
        .click();
    await page
        .getByLabel("Hạng giải 1", { exact: true })
        .selectOption("giai_nhi");
    await page.getByLabel("Cấp giải 1", { exact: true }).selectOption("tinh");
    await page
        .getByLabel("Môn đạt giải 1", { exact: true })
        .selectOption("toan");
    await expect(page.getByLabel("Điểm môn 1", { exact: true })).toHaveValue(
        "8.75",
    );
    await expect(
        page.getByLabel("Học kỳ bảng điểm 2", { exact: true }),
    ).toHaveValue("2");
    await expect(
        page.getByLabel("Điểm chứng chỉ 1", { exact: true }),
    ).toHaveValue("7.0");
    await expect(
        page.getByLabel("Minh chứng giải thưởng 1", { exact: true }),
    ).toBeVisible();
});

test("Tài khoản cũ: có form yêu cầu OTP đến liên hệ đã lưu", async ({
    page,
}) => {
    await page.goto("/nop-ho-so");
    await page
        .getByRole("button", { name: "Kích hoạt hồ sơ CCCD cũ", exact: true })
        .click();
    await page
        .getByLabel("CCCD đăng nhập", { exact: true })
        .fill("000000000001");
    await page
        .getByLabel("Kênh nhận mã", { exact: true })
        .selectOption("email");
    await expect(
        page.getByRole("button", { name: "Gửi mã kích hoạt", exact: true }),
    ).toBeVisible();
    await expect(
        page.getByLabel("Mật khẩu thí sinh", { exact: true }),
    ).toHaveCount(0);
    // Chỉ kiểm tra UI: không gửi OTP hoặc sửa tài khoản/database thật.
    await page.getByLabel("Kênh nhận mã", { exact: true }).selectOption("sms");
    await expect(page.getByLabel("Kênh nhận mã", { exact: true })).toHaveValue(
        "sms",
    );
});
