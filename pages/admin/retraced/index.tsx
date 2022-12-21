import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Retraced: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/retraced/projects');
  }, [router]);

  return <p>Redirecting...</p>;
};

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default Retraced;
