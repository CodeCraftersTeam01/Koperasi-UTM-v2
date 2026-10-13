export const ADMIN_PATH = 'panel-utm-4dmn';

export const adminPath = (sub = '') => {
  const suffix = String(sub).replace(/^\/+/, '');
  return suffix ? `/${ADMIN_PATH}/${suffix}` : `/${ADMIN_PATH}`;
};

export const isAdminPath = (pathname = '') =>
  pathname === `/${ADMIN_PATH}` || pathname.startsWith(`/${ADMIN_PATH}/`);
