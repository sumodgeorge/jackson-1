import type { NextPage, GetServerSidePropsContext } from 'next';
import React from 'react';
import { useRouter } from 'next/router';
import DirectoryInfo from '@components/dsync/DirectoryInfo';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const DirectoryDetailsPage: NextPage = () => {
  const router = useRouter();

  const { token, directoryId } = router.query as { token: string; directoryId: string };

  return <DirectoryInfo directoryId={directoryId} setupLinkToken={token} />;
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default DirectoryDetailsPage;
