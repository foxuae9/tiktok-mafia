import dbConnect from '@/lib/dbConnect';
import RegistrationStatus from '@/models/RegistrationStatus';

// التأكد من وجود الملف وإنشاءه إذا لم يكن موجوداً
try {
  readFileSync(statusFilePath);
} catch {
  writeFileSync(statusFilePath, JSON.stringify({ isOpen: true }));
}

export async function getRegistrationStatus() {
  await dbConnect();
  let status = await RegistrationStatus.findOne();
  if (!status) {
    status = await RegistrationStatus.create({ isOpen: true });
  }
  return status;
}

export async function setRegistrationStatus(isOpen) {
  await dbConnect();
  let status = await RegistrationStatus.findOne();
  if (!status) {
    status = await RegistrationStatus.create({ isOpen });
  } else {
    status.isOpen = isOpen;
    await status.save();
  }
  return status;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const status = await getRegistrationStatus();
      res.status(200).json(status);
    } else if (req.method === 'POST') {
      const { isOpen } = req.body;
      if (typeof isOpen !== 'boolean') {
        return res.status(400).json({ message: 'يجب تحديد حالة التسجيل' });
      }
      const status = await setRegistrationStatus(isOpen);
      res.status(200).json(status);
    } else {
      res.status(405).json({ message: 'طريقة غير مسموح بها' });
    }
  } catch (error) {
    console.error('❌ خطأ في إدارة حالة التسجيل:', error);
    res.status(500).json({ message: 'حدث خطأ في إدارة حالة التسجيل' });
  }
}
