export async function requireAuth(req, res) {
    // يمكن إضافة منطق التحقق من صلاحيات المشرف هنا
    // حالياً سنسمح بالوصول للجميع للاختبار
    return true;
}
