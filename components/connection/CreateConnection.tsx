import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  saveConnection,
  fieldCatalogFilterByConnection,
  renderFieldList,
  useFieldCatalog,
  excludeFallback,
  type AdminPortalSSODefaults,
  type FormObj,
  type FieldCatalogItem,
} from './utils';
import { mutate } from 'swr';
import { ApiResponse } from 'types';
import { errorToast } from '@components/Toaster';
import { useTranslation } from 'next-i18next';
import { LinkBack } from '@components/LinkBack';
import { ButtonPrimary } from '@components/ButtonPrimary';
import { InputWithCopyButton } from '@components/ClipboardButton';

function getInitialState(connectionType, fieldCatalog: FieldCatalogItem[]) {
  const _state = {};

  fieldCatalog.forEach(({ key, type, members, fallback, attributes: { connection } }) => {
    let value;
    if (connection && connection !== connectionType) {
      return;
    }
    /** By default those fields which do not have a fallback.activateCondition  will be excluded */
    if (typeof fallback === 'object' && typeof fallback.activateCondition !== 'function') {
      return;
    }
    if (type === 'object') {
      value = getInitialState(connectionType, members as FieldCatalogItem[]);
    }
    _state[key] = value ? value : '';
  });
  return _state;
}

const CreateConnection = ({
  setupLinkToken,
  idpEntityID,
  isSettingsView = false,
  adminPortalSSODefaults,
}: {
  setupLinkToken?: string;
  idpEntityID?: string;
  isSettingsView?: boolean;
  adminPortalSSODefaults?: AdminPortalSSODefaults;
}) => {
  const fieldCatalog = useFieldCatalog({ isSettingsView });
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // STATE: New connection type
  const [newConnectionType, setNewConnectionType] = useState<'saml' | 'oidc'>('saml');

  const handleNewConnectionTypeChange = (event) => {
    setNewConnectionType(event.target.value);
  };

  const connectionIsSAML = newConnectionType === 'saml';
  const connectionIsOIDC = newConnectionType === 'oidc';

  const backUrl = setupLinkToken
    ? `/setup/${setupLinkToken}`
    : isSettingsView
    ? '/admin/settings/sso-connection'
    : '/admin/sso-connection';
  const redirectUrl = setupLinkToken
    ? `/setup/${setupLinkToken}/sso-connection`
    : isSettingsView
    ? '/admin/settings/sso-connection'
    : '/admin/sso-connection';
  const mutationUrl = setupLinkToken
    ? `/api/setup/${setupLinkToken}/sso-connection`
    : isSettingsView
    ? '/api/admin/connections?isSystemSSO'
    : '/api/admin/connections';

  // FORM LOGIC: SUBMIT
  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);

    await saveConnection({
      formObj: formObj,
      connectionIsSAML: connectionIsSAML,
      connectionIsOIDC: connectionIsOIDC,
      setupLinkToken,
      callback: async (rawResponse) => {
        setLoading(false);

        const response: ApiResponse = await rawResponse.json();

        if ('error' in response) {
          errorToast(response.error.message);
          return;
        }

        if (rawResponse.ok) {
          await mutate(mutationUrl);
          router.replace(redirectUrl);
        }
      },
    });
  };

  // STATE: FORM
  const [formObj, setFormObj] = useState<FormObj>(() =>
    isSettingsView
      ? { ...getInitialState(newConnectionType, fieldCatalog), ...adminPortalSSODefaults }
      : { ...getInitialState(newConnectionType, fieldCatalog) }
  );
  // Resync form state on save
  useEffect(() => {
    const _state = getInitialState(newConnectionType, fieldCatalog);
    setFormObj(isSettingsView ? { ..._state, ...adminPortalSSODefaults } : _state);
  }, [newConnectionType, fieldCatalog, isSettingsView, adminPortalSSODefaults]);

  // HANDLER: Track fallback display
  const activateFallback = (key, fallbackKey) => {
    setFormObj((cur) => {
      const temp = { ...cur };
      delete temp[key];
      const fallbackItem = fieldCatalog.find(({ key }) => key === fallbackKey);
      const fallbackItemVal = fallbackItem?.type === 'object' ? {} : '';
      return { ...temp, [fallbackKey]: fallbackItemVal };
    });
  };

  return (
    <>
      <LinkBack href={backUrl} />
      {idpEntityID && setupLinkToken && (
        <div className='mb-5 mt-5 items-center justify-between'>
          <div className='form-control'>
            <InputWithCopyButton text={idpEntityID} label={t('idp_entity_id')} />
          </div>
        </div>
      )}
      <div>
        <h2 className='mb-5 mt-5 font-bold text-gray-700 dark:text-white md:text-xl'>
          {t('create_sso_connection')}
        </h2>
        <div className='mb-4 flex'>
          <div className='mr-2 py-3'>{t('select_type')}:</div>
          <div className='flex flex-nowrap items-stretch justify-start gap-1 rounded-md border-2 border-dashed py-3'>
            <div>
              <input
                type='radio'
                name='connection'
                value='saml'
                className='peer sr-only'
                checked={newConnectionType === 'saml'}
                onChange={handleNewConnectionTypeChange}
                id='saml-conn'
              />
              <label
                htmlFor='saml-conn'
                className='cursor-pointer rounded-md border-2 border-solid py-3 px-8 font-semibold hover:shadow-md peer-checked:border-secondary-focus peer-checked:bg-secondary peer-checked:text-white'>
                {t('saml')}
              </label>
            </div>
            <div>
              <input
                type='radio'
                name='connection'
                value='oidc'
                className='peer sr-only'
                checked={newConnectionType === 'oidc'}
                onChange={handleNewConnectionTypeChange}
                id='oidc-conn'
              />
              <label
                htmlFor='oidc-conn'
                className='cursor-pointer rounded-md border-2 border-solid px-8 py-3 font-semibold hover:shadow-md peer-checked:bg-secondary peer-checked:text-white'>
                {t('oidc')}
              </label>
            </div>
          </div>
        </div>
        <form onSubmit={save}>
          <div className='min-w-[28rem] rounded border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            {fieldCatalog
              .filter(fieldCatalogFilterByConnection(newConnectionType))
              .filter(({ attributes: { hideInSetupView } }) => (setupLinkToken ? !hideInSetupView : true))
              .filter(excludeFallback(formObj))
              .map(renderFieldList({ formObj, setFormObj, activateFallback }))}
            <div className='flex'>
              <ButtonPrimary loading={loading} data-testid='submit-form-create-sso'>
                {t('save_changes')}
              </ButtonPrimary>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateConnection;
