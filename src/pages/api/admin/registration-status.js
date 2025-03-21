import dbConnect from '@/lib/dbConnect';
import RegistrationStatus from '@/models/RegistrationStatus';

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      let status = await RegistrationStatus.findOne({});
      
      if (!status) {
        status = await RegistrationStatus.create({ isOpen: true });
      }
      
      return res.status(200).json(status);
    }

    if (req.method === 'POST') {
      const { isOpen } = req.body;
      
      let status = await RegistrationStatus.findOne({});
      
      if (!status) {
        status = await RegistrationStatus.create({ isOpen });
      } else {
        status.isOpen = isOpen;
        await status.save();
      }
      
      return res.status(200).json(status);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('خطأ:', error);
    return res.status(500).json({ message: error.message });
  }
}
