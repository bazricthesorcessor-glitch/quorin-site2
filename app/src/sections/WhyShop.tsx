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
      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
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
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Why Shop{' '}
            <span style={{ color: 'var(--color-accent)' }}>From Us</span>
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
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.12 }}
              >
                <motion.div
                  className="relative p-8 rounded-2xl h-full"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                    borderColor: 'rgba(201, 169, 110, 0.3)',
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Icon */}
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: 'rgba(201, 169, 110, 0.08)',
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon size={22} style={{ color: 'var(--color-accent)' }} />
                  </motion.div>

                  {/* Content */}
                  <h3
                    className="text-base font-semibold mb-2"
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8 + index * 0.1, type: 'spring', stiffness: 200 }}
            >
              <motion.span
                className="text-3xl md:text-4xl font-bold block mb-2"
                style={{ color: 'var(--color-accent)' }}
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
