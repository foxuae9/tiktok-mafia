import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Head from 'next/head';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Head>
        <title>Fox UAE - إبداع بلا حدود</title>
        <meta name="description" content="موقع Fox UAE - منصة إبداعية للمحتوى الرقمي" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="container mx-auto px-4 py-20">
        {/* القسم الرئيسي */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
            Fox UAE
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-tajawal">
            نبتكر تجارب رقمية استثنائية
          </p>
        </motion.div>

        {/* قسم الخدمات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20" ref={ref}>
          {[
            {
              title: 'تطوير المواقع',
              description: 'تصميم وتطوير مواقع عصرية وتفاعلية',
              icon: '🌐'
            },
            {
              title: 'تجربة المستخدم',
              description: 'تصميم واجهات سهلة الاستخدام وجذابة',
              icon: '✨'
            },
            {
              title: 'حلول مبتكرة',
              description: 'تقديم حلول تقنية مبتكرة لمشاريعك',
              icon: '💡'
            }
          ].map((service, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 hover:bg-opacity-70 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
              <p className="text-gray-400">{service.description}</p>
            </motion.div>
          ))}
        </div>

        {/* قسم المشاريع */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">مشاريعنا المميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'منصة البث المباشر',
                description: 'منصة متكاملة لعرض وإدارة البث المباشر',
                image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800'
              },
              {
                title: 'نظام إدارة المحتوى',
                description: 'نظام متطور لإدارة المحتوى الرقمي',
                image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800'
              }
            ].map((project, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="relative group overflow-hidden rounded-2xl"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white p-6">
                  <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-200">{project.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* قسم الاتصال */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">تواصل معنا</h2>
          <p className="text-xl text-gray-300 mb-8">نحن هنا لمساعدتك في تحقيق رؤيتك</p>
          <a
            href="mailto:contact@foxuae.com"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            ابدأ مشروعك
          </a>
        </motion.div>
      </main>

      <footer className="text-center py-8 text-gray-400">
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} Fox UAE</p>
      </footer>
    </div>
  );
}
