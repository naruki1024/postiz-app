'use client';

import { ReactNode, useCallback } from 'react';
import { Title } from '@gitroom/frontend/components/layout/title';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';
import { TopMenu } from '@gitroom/frontend/components/layout/top.menu';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { ToolTip } from '@gitroom/frontend/components/layout/top.tip';
import { ShowMediaBoxModal } from '@gitroom/frontend/components/media/media.component';
import Image from 'next/image';
import { Toaster } from '@gitroom/react/toaster/toaster';
import { ShowPostSelector } from '@gitroom/frontend/components/post-url-selector/post.url.selector';
import { OrganizationSelector } from '@gitroom/frontend/components/layout/organization.selector';
import NotificationComponent from '@gitroom/frontend/components/notifications/notification.component';
import Link from 'next/link';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import { ShowLinkedinCompany } from '@gitroom/frontend/components/launches/helpers/linkedin.component';
import { SettingsComponent } from '@gitroom/frontend/components/layout/settings.component';
import { Onboarding } from '@gitroom/frontend/components/onboarding/onboarding';
import { Support } from '@gitroom/frontend/components/layout/support';
import { ContinueProvider } from '@gitroom/frontend/components/layout/continue.provider';
import { CopilotKit } from '@copilotkit/react-core';
import { Impersonate } from '@gitroom/frontend/components/layout/impersonate';
import clsx from 'clsx';
import { BillingComponent } from '@gitroom/frontend/components/billing/billing.component';
import dynamic from 'next/dynamic';
import { NewSubscription } from '@gitroom/frontend/components/layout/new.subscription';
import { useVariables } from '@gitroom/react/helpers/variable.context';
const ModeComponent = dynamic(
  () => import('@gitroom/frontend/components/layout/mode.component'),
  { ssr: false }
);

import { extend } from 'dayjs';

extend(utc);
extend(weekOfYear);
extend(isoWeek);
extend(isBetween);

export const LayoutSettings = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch();
  const { isGeneral } = useVariables();
  const { backendUrl, billingEnabled } = useVariables();
  const load = useCallback(async (path: string) => {
    return await (await fetch(path)).json();
  }, []);

  const { data: user } = useSWR('/user/self', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
  });

  if (!user) return null;

  return (
    <ContextWrapper user={user}>
      <CopilotKit
        credentials="include"
        runtimeUrl={backendUrl + '/copilot/chat'}
      >
        <ContextWrapper user={user}>
          <MantineWrapper>
            <ToolTip />
            <ShowMediaBoxModal />
            <ShowLinkedinCompany />
            <Toaster />
            <ShowPostSelector />
            <NewSubscription />
            {user.tier !== 'FREE' && <Onboarding />}
            <Support />
            <ContinueProvider />
            <div className="min-h-[100vh] w-full max-w-[1440px] mx-auto bg-primary px-[12px] text-textColor flex flex-col">
              {user?.admin && <Impersonate />}
              <div className="px-[23px] flex h-[80px] items-center justify-between z-[200] sticky top-0 bg-primary">
                <Link
                  href="/"
                  className="text-2xl flex items-center gap-[10px] text-textColor"
                >
                  <div className="min-w-[55px]">
                    <Image
                      src={isGeneral ? '/postiz.svg' : '/logo.svg'}
                      width={55}
                      height={53}
                      alt="Logo"
                    />
                  </div>
                  <div
                    className={clsx(!isGeneral ? 'mt-[12px]' : 'min-w-[80px]')}
                  >
                    {isGeneral ? (
                      <svg
                        width="80"
                        height="75"
                        viewBox="0 0 366 167"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24.9659 30.4263V43.3825C26.9237 41.3095 29.3998 39.582 32.3941 38.2C35.3885 36.7028 39.0162 35.9543 43.2774 35.9543C47.1931 35.9543 50.8784 36.7028 54.3334 38.2C57.9036 39.6972 61.0131 42.1157 63.6619 45.4555C66.4259 48.6802 68.6141 52.9989 70.2264 58.4118C71.8387 63.8246 72.6449 70.3891 72.6449 78.1053C72.6449 83.6333 72.1266 89.1613 71.0902 94.6893C70.1688 100.217 68.4989 105.169 66.0804 109.546C63.6619 113.922 60.3796 117.492 56.2336 120.256C52.2028 122.905 47.1355 124.23 41.0316 124.23C36.6553 124.23 33.2003 123.654 30.6666 122.502C28.1329 121.235 26.2327 119.796 24.9659 118.183V160.162L0.0898438 166.381V30.4263H24.9659ZM32.7396 109.2C35.734 109.2 38.2676 108.221 40.3406 106.264C42.4136 104.191 44.026 101.542 45.1776 98.3171C46.4445 95.0924 47.3082 91.5222 47.7689 87.6066C48.3447 83.5757 48.6326 79.6025 48.6326 75.6868C48.6326 69.3526 48.0568 64.3429 46.9051 60.6575C45.8686 56.9722 44.6018 54.2658 43.1046 52.5383C41.6075 50.6956 40.1103 49.5439 38.6131 49.0833C37.2311 48.6226 36.137 48.3923 35.3309 48.3923C33.2579 48.3923 31.2425 49.1409 29.2846 50.638C27.3268 52.02 25.8872 54.1506 24.9659 57.0298V105.227C25.5417 106.148 26.463 107.07 27.7299 107.991C28.9967 108.797 30.6666 109.2 32.7396 109.2Z"
                          fill="currentColor"
                        />
                        <path
                          d="M188.176 31.4627C191.055 42.5188 193.588 51.5593 195.777 58.5845C197.965 65.4945 199.807 71.3105 201.305 76.0323C202.917 80.7541 204.126 84.9001 204.932 88.4703C205.854 92.0405 206.314 96.0137 206.314 100.39C208.272 99.1232 210.172 97.7988 212.015 96.4168C213.858 94.9196 215.413 93.5376 216.679 92.2708H223.935C220.825 96.9926 217.543 100.908 214.088 104.018C210.633 107.012 207.293 109.661 204.069 111.964C201.996 116.456 198.829 119.623 194.567 121.466C190.306 123.308 185.872 124.23 181.266 124.23C176.083 124.23 171.649 123.539 167.964 122.157C164.279 120.659 161.227 118.702 158.808 116.283C156.505 113.749 154.777 110.87 153.626 107.646C152.474 104.421 151.898 101.023 151.898 97.4533C151.898 93.5376 152.819 90.4857 154.662 88.2975C156.62 85.9942 158.866 84.8426 161.399 84.8426C168.424 84.8426 171.937 87.6641 171.937 93.3073C171.937 95.15 171.304 96.7047 170.037 97.9716C168.77 99.2384 167.158 99.8718 165.2 99.8718C164.278 99.8718 163.3 99.7566 162.263 99.5263C161.342 99.1808 160.593 98.5474 160.017 97.6261C160.939 101.657 162.436 104.824 164.509 107.127C166.697 109.431 169.461 110.582 172.801 110.582C175.68 110.582 177.811 109.891 179.193 108.509C180.575 107.012 181.266 104.478 181.266 100.908C181.266 97.1078 180.92 93.7104 180.229 90.7161C179.653 87.6066 178.732 84.2091 177.465 80.5238C176.198 76.8385 174.644 72.4621 172.801 67.3948C170.958 62.2123 168.885 55.5326 166.582 47.3558C160.823 59.6786 153.222 67.5675 143.779 71.0225C143.779 71.9439 143.779 72.8652 143.779 73.7865C143.894 74.5927 143.952 75.4565 143.952 76.3778C143.952 83.0575 143.376 89.334 142.224 95.2076C141.072 100.966 139.115 106.033 136.351 110.41C133.702 114.671 130.247 118.068 125.986 120.602C121.724 123.02 116.484 124.23 110.265 124.23C106.004 124.23 101.916 123.596 98 122.329C94.1995 120.947 90.8021 118.759 87.8078 115.765C84.8134 112.655 82.3949 108.624 80.5523 103.672C78.8248 98.605 77.961 92.4436 77.961 85.188C77.961 80.2359 78.4793 74.9382 79.5158 69.295C80.5523 63.5367 82.4525 58.1814 85.2165 53.2293C87.9805 48.2771 91.7234 44.1887 96.4453 40.964C101.282 37.6242 107.444 35.9543 114.93 35.9543C122.646 35.9543 128.807 38.0273 133.414 42.1733C138.136 46.3193 141.303 52.9989 142.915 62.2123C146.946 61.2909 150.574 58.5269 153.798 53.9203C157.138 49.1984 160.305 42.8643 163.3 34.9177L188.176 31.4627ZM115.102 107.991C117.521 107.991 119.594 107.185 121.321 105.573C123.164 103.845 124.661 101.542 125.813 98.6626C126.964 95.6682 127.771 92.1556 128.231 88.1248C128.807 84.094 129.095 79.7176 129.095 74.9958V72.75C124.488 71.7135 122.185 68.3161 122.185 62.5578C122.185 58.8724 123.682 56.4539 126.677 55.3023C125.41 51.6169 123.855 49.1984 122.012 48.0468C120.285 46.8951 118.788 46.3193 117.521 46.3193C114.987 46.3193 112.799 47.5285 110.956 49.947C109.229 52.2504 107.789 55.2447 106.638 58.93C105.486 62.5002 104.622 66.4734 104.046 70.8498C103.586 75.2261 103.355 79.4297 103.355 83.4605C103.355 88.6431 103.701 92.8466 104.392 96.0713C105.198 99.296 106.177 101.772 107.329 103.5C108.48 105.227 109.747 106.436 111.129 107.127C112.511 107.703 113.835 107.991 115.102 107.991Z"
                          fill="currentColor"
                        />
                        <path
                          d="M239.554 9.52348V36.818H250.092V43.728H239.554V95.5531C239.554 100.39 240.187 103.615 241.454 105.227C242.836 106.724 245.197 107.473 248.537 107.473C251.877 107.473 254.641 106.033 256.829 103.154C259.132 100.275 260.457 96.6471 260.802 92.2708H268.058C267.136 99.296 265.524 104.939 263.221 109.2C260.917 113.346 258.326 116.571 255.447 118.874C252.568 121.062 249.631 122.502 246.637 123.193C243.642 123.884 240.993 124.23 238.69 124.23C229.822 124.23 223.603 121.811 220.033 116.974C216.463 112.022 214.678 105.515 214.678 97.4533V43.728H209.15V36.818H214.678V12.9785L239.554 9.52348Z"
                          fill="currentColor"
                        />
                        <path
                          d="M258.833 13.8422C258.833 10.0417 260.158 6.81706 262.806 4.16823C265.455 1.40422 268.68 0.0222168 272.48 0.0222168C276.281 0.0222168 279.506 1.40422 282.154 4.16823C284.918 6.81706 286.3 10.0417 286.3 13.8422C286.3 17.6427 284.918 20.8674 282.154 23.5162C279.506 26.1651 276.281 27.4895 272.48 27.4895C268.68 27.4895 265.455 26.1651 262.806 23.5162C260.158 20.8674 258.833 17.6427 258.833 13.8422ZM285.609 36.818V95.5531C285.609 100.39 286.243 103.615 287.51 105.227C288.892 106.724 291.253 107.473 294.592 107.473C296.09 107.473 297.184 107.358 297.875 107.127C298.681 106.897 299.372 106.667 299.948 106.436C300.063 107.012 300.12 107.588 300.12 108.164C300.12 108.74 300.12 109.315 300.12 109.891C300.12 112.77 299.602 115.131 298.566 116.974C297.644 118.817 296.377 120.314 294.765 121.466C293.268 122.502 291.598 123.193 289.755 123.539C288.028 123.999 286.358 124.23 284.746 124.23C275.878 124.23 269.659 121.811 266.089 116.974C262.518 112.022 260.733 105.515 260.733 97.4533V36.818H285.609ZM351.773 107.473C350.391 107.358 349.354 106.897 348.663 106.091C347.972 105.169 347.627 104.133 347.627 102.981C347.627 101.484 348.26 100.045 349.527 98.6626C350.794 97.1654 352.867 96.4168 355.746 96.4168C358.971 96.4168 361.389 97.5109 363.001 99.6991C364.614 101.772 365.42 104.248 365.42 107.127C365.42 108.97 365.074 110.87 364.383 112.828C363.692 114.671 362.598 116.398 361.101 118.011C359.604 119.508 357.761 120.775 355.573 121.811C353.385 122.732 350.851 123.193 347.972 123.193H300.293L334.152 46.1465H321.369C318.835 46.1465 316.704 46.3193 314.977 46.6648C313.365 46.8951 312.558 47.5285 312.558 48.565C312.558 49.0257 312.674 49.256 312.904 49.256C313.249 49.256 313.595 49.3712 313.94 49.6015C314.401 49.8318 314.747 50.2925 314.977 50.9835C315.322 51.6745 315.495 52.8838 315.495 54.6113C315.495 57.1449 314.689 58.9876 313.077 60.1393C311.579 61.2909 309.852 61.8668 307.894 61.8668C305.591 61.8668 303.345 61.1182 301.157 59.621C299.084 58.0087 298.047 55.5902 298.047 52.3655C298.047 50.638 298.393 48.9105 299.084 47.183C299.775 45.3403 300.811 43.6704 302.193 42.1733C303.575 40.5609 305.303 39.2941 307.376 38.3728C309.449 37.3363 311.867 36.818 314.631 36.818H362.138L329.142 109.891C329.833 109.891 330.812 109.949 332.079 110.064C333.346 110.179 334.67 110.294 336.052 110.41C337.55 110.525 338.989 110.64 340.371 110.755C341.868 110.87 343.193 110.928 344.344 110.928C346.417 110.928 348.145 110.697 349.527 110.237C351.024 109.776 351.773 108.855 351.773 107.473Z"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      'Gitroom'
                    )}
                  </div>
                </Link>
                {user?.orgId &&
                (user.tier !== 'FREE' || !isGeneral || !billingEnabled) ? (
                  <TopMenu />
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-[8px]">
                  <ModeComponent />
                  <SettingsComponent />
                  <NotificationComponent />
                  <OrganizationSelector />
                </div>
              </div>
              <div className="flex-1 flex">
                <div className="flex-1 rounded-3xl px-[23px] py-[17px] flex flex-col">
                  {user.tier === 'FREE' && isGeneral && billingEnabled ? (
                    <>
                      <div className="text-center mb-[20px] text-xl">
                        <h1 className="text-3xl">
                          Join 1000+ Entrepreneurs Who Use Postiz
                          <br />
                          To Manage All Your Social Media Channels
                        </h1>
                        <br />
                        <div className="table mx-auto">
                          <div className="flex gap-[5px] items-center">
                            <div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M16.2806 9.21937C16.3504 9.28903 16.4057 9.37175 16.4434 9.46279C16.4812 9.55384 16.5006 9.65144 16.5006 9.75C16.5006 9.84856 16.4812 9.94616 16.4434 10.0372C16.4057 10.1283 16.3504 10.211 16.2806 10.2806L11.0306 15.5306C10.961 15.6004 10.8783 15.6557 10.7872 15.6934C10.6962 15.7312 10.5986 15.7506 10.5 15.7506C10.4014 15.7506 10.3038 15.7312 10.2128 15.6934C10.1218 15.6557 10.039 15.6004 9.96938 15.5306L7.71938 13.2806C7.57865 13.1399 7.49959 12.949 7.49959 12.75C7.49959 12.551 7.57865 12.3601 7.71938 12.2194C7.86011 12.0786 8.05098 11.9996 8.25 11.9996C8.44903 11.9996 8.6399 12.0786 8.78063 12.2194L10.5 13.9397L15.2194 9.21937C15.289 9.14964 15.3718 9.09432 15.4628 9.05658C15.5538 9.01884 15.6514 8.99941 15.75 8.99941C15.8486 8.99941 15.9462 9.01884 16.0372 9.05658C16.1283 9.09432 16.211 9.14964 16.2806 9.21937ZM21.75 12C21.75 13.9284 21.1782 15.8134 20.1068 17.4168C19.0355 19.0202 17.5127 20.2699 15.7312 21.0078C13.9496 21.7458 11.9892 21.9389 10.0979 21.5627C8.20656 21.1865 6.46928 20.2579 5.10571 18.8943C3.74215 17.5307 2.81355 15.7934 2.43735 13.9021C2.06114 12.0108 2.25422 10.0504 2.99218 8.26884C3.73013 6.48726 4.97982 4.96451 6.58319 3.89317C8.18657 2.82183 10.0716 2.25 12 2.25C14.585 2.25273 17.0634 3.28084 18.8913 5.10872C20.7192 6.93661 21.7473 9.41498 21.75 12ZM20.25 12C20.25 10.3683 19.7661 8.77325 18.8596 7.41655C17.9531 6.05984 16.6646 5.00242 15.1571 4.37799C13.6497 3.75357 11.9909 3.59019 10.3905 3.90852C8.79017 4.22685 7.32016 5.01259 6.16637 6.16637C5.01259 7.32015 4.22685 8.79016 3.90853 10.3905C3.5902 11.9908 3.75358 13.6496 4.378 15.1571C5.00242 16.6646 6.05984 17.9531 7.41655 18.8596C8.77326 19.7661 10.3683 20.25 12 20.25C14.1873 20.2475 16.2843 19.3775 17.8309 17.8309C19.3775 16.2843 20.2475 14.1873 20.25 12Z"
                                  fill="#06ff00"
                                />
                              </svg>
                            </div>
                            <div>100% no-risk trial</div>
                          </div>
                          <div className="flex gap-[5px] items-center">
                            <div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M16.2806 9.21937C16.3504 9.28903 16.4057 9.37175 16.4434 9.46279C16.4812 9.55384 16.5006 9.65144 16.5006 9.75C16.5006 9.84856 16.4812 9.94616 16.4434 10.0372C16.4057 10.1283 16.3504 10.211 16.2806 10.2806L11.0306 15.5306C10.961 15.6004 10.8783 15.6557 10.7872 15.6934C10.6962 15.7312 10.5986 15.7506 10.5 15.7506C10.4014 15.7506 10.3038 15.7312 10.2128 15.6934C10.1218 15.6557 10.039 15.6004 9.96938 15.5306L7.71938 13.2806C7.57865 13.1399 7.49959 12.949 7.49959 12.75C7.49959 12.551 7.57865 12.3601 7.71938 12.2194C7.86011 12.0786 8.05098 11.9996 8.25 11.9996C8.44903 11.9996 8.6399 12.0786 8.78063 12.2194L10.5 13.9397L15.2194 9.21937C15.289 9.14964 15.3718 9.09432 15.4628 9.05658C15.5538 9.01884 15.6514 8.99941 15.75 8.99941C15.8486 8.99941 15.9462 9.01884 16.0372 9.05658C16.1283 9.09432 16.211 9.14964 16.2806 9.21937ZM21.75 12C21.75 13.9284 21.1782 15.8134 20.1068 17.4168C19.0355 19.0202 17.5127 20.2699 15.7312 21.0078C13.9496 21.7458 11.9892 21.9389 10.0979 21.5627C8.20656 21.1865 6.46928 20.2579 5.10571 18.8943C3.74215 17.5307 2.81355 15.7934 2.43735 13.9021C2.06114 12.0108 2.25422 10.0504 2.99218 8.26884C3.73013 6.48726 4.97982 4.96451 6.58319 3.89317C8.18657 2.82183 10.0716 2.25 12 2.25C14.585 2.25273 17.0634 3.28084 18.8913 5.10872C20.7192 6.93661 21.7473 9.41498 21.75 12ZM20.25 12C20.25 10.3683 19.7661 8.77325 18.8596 7.41655C17.9531 6.05984 16.6646 5.00242 15.1571 4.37799C13.6497 3.75357 11.9909 3.59019 10.3905 3.90852C8.79017 4.22685 7.32016 5.01259 6.16637 6.16637C5.01259 7.32015 4.22685 8.79016 3.90853 10.3905C3.5902 11.9908 3.75358 13.6496 4.378 15.1571C5.00242 16.6646 6.05984 17.9531 7.41655 18.8596C8.77326 19.7661 10.3683 20.25 12 20.25C14.1873 20.2475 16.2843 19.3775 17.8309 17.8309C19.3775 16.2843 20.2475 14.1873 20.25 12Z"
                                  fill="#06ff00"
                                />
                              </svg>
                            </div>
                            <div>Pay nothing for the first 7 days</div>
                          </div>
                          <div className="flex gap-[5px] items-center">
                            <div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M16.2806 9.21937C16.3504 9.28903 16.4057 9.37175 16.4434 9.46279C16.4812 9.55384 16.5006 9.65144 16.5006 9.75C16.5006 9.84856 16.4812 9.94616 16.4434 10.0372C16.4057 10.1283 16.3504 10.211 16.2806 10.2806L11.0306 15.5306C10.961 15.6004 10.8783 15.6557 10.7872 15.6934C10.6962 15.7312 10.5986 15.7506 10.5 15.7506C10.4014 15.7506 10.3038 15.7312 10.2128 15.6934C10.1218 15.6557 10.039 15.6004 9.96938 15.5306L7.71938 13.2806C7.57865 13.1399 7.49959 12.949 7.49959 12.75C7.49959 12.551 7.57865 12.3601 7.71938 12.2194C7.86011 12.0786 8.05098 11.9996 8.25 11.9996C8.44903 11.9996 8.6399 12.0786 8.78063 12.2194L10.5 13.9397L15.2194 9.21937C15.289 9.14964 15.3718 9.09432 15.4628 9.05658C15.5538 9.01884 15.6514 8.99941 15.75 8.99941C15.8486 8.99941 15.9462 9.01884 16.0372 9.05658C16.1283 9.09432 16.211 9.14964 16.2806 9.21937ZM21.75 12C21.75 13.9284 21.1782 15.8134 20.1068 17.4168C19.0355 19.0202 17.5127 20.2699 15.7312 21.0078C13.9496 21.7458 11.9892 21.9389 10.0979 21.5627C8.20656 21.1865 6.46928 20.2579 5.10571 18.8943C3.74215 17.5307 2.81355 15.7934 2.43735 13.9021C2.06114 12.0108 2.25422 10.0504 2.99218 8.26884C3.73013 6.48726 4.97982 4.96451 6.58319 3.89317C8.18657 2.82183 10.0716 2.25 12 2.25C14.585 2.25273 17.0634 3.28084 18.8913 5.10872C20.7192 6.93661 21.7473 9.41498 21.75 12ZM20.25 12C20.25 10.3683 19.7661 8.77325 18.8596 7.41655C17.9531 6.05984 16.6646 5.00242 15.1571 4.37799C13.6497 3.75357 11.9909 3.59019 10.3905 3.90852C8.79017 4.22685 7.32016 5.01259 6.16637 6.16637C5.01259 7.32015 4.22685 8.79016 3.90853 10.3905C3.5902 11.9908 3.75358 13.6496 4.378 15.1571C5.00242 16.6646 6.05984 17.9531 7.41655 18.8596C8.77326 19.7661 10.3683 20.25 12 20.25C14.1873 20.2475 16.2843 19.3775 17.8309 17.8309C19.3775 16.2843 20.2475 14.1873 20.25 12Z"
                                  fill="#06ff00"
                                />
                              </svg>
                            </div>
                            <div>Cancel anytime, hassle-free</div>
                          </div>
                        </div>
                      </div>
                      <BillingComponent />
                    </>
                  ) : (
                    <>
                      <Title />
                      <div className="flex flex-1 flex-col">{children}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </MantineWrapper>
        </ContextWrapper>
      </CopilotKit>
    </ContextWrapper>
  );
};
