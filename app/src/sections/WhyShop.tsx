import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, BookOpen, Truck, BadgePercent } from 'lucide-react';
import { benefits } from '@/data/products';

const icons = [Award, BookOpen, Truck, BadgePercent];

export default function WhyShop() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-4 md:px-8 overflow-hidden"
      style={{ background: 'var(--color-dominant)' }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 26, 60, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="text-xs tracking-[0.3em] mb-4 block"
            style={{ color: 'var(--color-accent)' }}
          >
            WHY CHOOSE US
          </motion.span>
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Why Shop{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #ff1a3c, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              From Us
            </span>
          </motion.h2>
          <motion.p
            className="text-sm max-w-lg mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            We are passionate about empowering creators with the best supplies,
            guidance, and value for their crafting journey.
          </motion.p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={benefit.title}
                className="relative group"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <motion.div
                  className="relative p-8 rounded-2xl h-full"
                  style={{
                    background: 'rgba(26, 26, 40, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                  }}
                  whileHover={{
                    borderColor: 'rgba(255, 26, 60, 0.3)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 26, 60, 0.05)',
                    y: -5,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Icon */}
                  <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 26, 60, 0.15), rgba(0, 212, 255, 0.15))',
                      border: '1px solid rgba(255, 26, 60, 0.2)',
                    }}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <Icon size={24} style={{ color: 'var(--color-accent)' }} />
                  </motion.div>

                  {/* Number */}
                  <span
                    className="absolute top-4 right-4 text-5xl font-black"
                    style={{ color: 'rgba(255, 26, 60, 0.08)' }}
                  >
                    0{index + 1}
                  </span>

                  {/* Content */}
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {benefit.description}
                  </p>

                  {/* Hover glow */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 50% 0%, rgba(255, 26, 60, 0.1) 0%, transparent 50%)',
                    }}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Row */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            { value: '25+', label: 'Products' },
            { value: '3', label: 'Categories' },
            { value: '85%', label: 'Max Discount' },
            { value: '1000+', label: 'Happy Makers' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8 + index * 0.1, type: 'spring' }}
            >
              <motion.span
                className="text-4xl md:text-5xl font-black block mb-2"
                style={{
                  background: 'linear-gradient(135deg, #ff1a3c, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.value}
              </motion.span>
              <span className="text-xs tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
                {stat.label.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
