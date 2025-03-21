import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const statusFilePath = path.join(process.cwd(), 'data', 'registration-status.json');

// التأكد من وجود الملف وإنشاءه إذا لم يكن موجوداً
try {
  readFileSync(statusFilePath);
} catch {
  writeFileSync(statusFilePath, JSON.stringify({ isOpen: true }));
}

export function getRegistrationStatus() {
  try {
    const data = readFileSync(statusFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return { isOpen: true };
  }
}

export function setRegistrationStatus(isOpen) {
  writeFileSync(statusFilePath, JSON.stringify({ isOpen }));
  return { isOpen };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const status = getRegistrationStatus();
    res.status(200).json(status);
  } else if (req.method === 'POST') {
    try {
      const { isOpen } = req.body;
      setRegistrationStatus(isOpen);
      res.status(200).json({ message: 'تم تحديث حالة التسجيل بنجاح' });
    } catch (error) {
      console.error('خطأ في تحديث حالة التسجيل:', error);
      res.status(500).json({ message: 'حدث خطأ أثناء تحديث حالة التسجيل' });
    }
  } else {
    res.status(405).json({ message: 'طريقة غير مسموح بها' });
  }
}
