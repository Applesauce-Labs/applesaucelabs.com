import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedTitle from '@site/src/components/HomepageFeatures/AnimatedTitle';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
        <AnimatedTitle />
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Applesauce Labs - Technology Consulting">
      <HomepageHeader />
      <main>
 
      <div className={styles.contactBadge}> 
          <div className={styles.qrCode}>
            <QRCodeSVG 
              value="mailto:sherman@applesaucelabs.com"
              size={80}
              level="L"
              includeMargin={false}
            />
          </div>
          <div className={styles.contactInfo}>
            <h2>Sherman Boyd</h2>
            <p>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
              sherman@applesaucelabs.com
            </p>
            <p>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              github: shermanhuman
            </p>
          </div>
        </div>

        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className={clsx('col col--4', styles.feature)}>
                <h3 style={{ fontFamily: "'Playwrite US Trad', cursive" }}>Consulting</h3>
                <p>Expert technology advice tailored to your needs</p>
              </div>
              <div className={clsx('col col--4', styles.feature)}>
                <h3 style={{ fontFamily: "'Playwrite US Trad', cursive" }}>Development</h3>
                <p>Custom software solutions for your business</p>
              </div>
              <div className={clsx('col col--4', styles.feature)}>
                <h3 style={{ fontFamily: "'Playwrite US Trad', cursive" }}>Training</h3>
                <p>Empower your team with cutting-edge skills</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}