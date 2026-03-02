import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../../../Firebase/config";
import { useNavigate } from "react-router-dom";
import { clearSelectedRole } from "../../../utils/roleStorage";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../../services/clinicFirestoreService";
import Swal from "../../../utils/swal";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const formatRelativeTime = (isoDate) => {
  if (!isoDate) return "Now";
  const timestamp = new Date(isoDate).getTime();
  const delta = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (delta < minute) return "Just now";
  if (delta < hour) return `${Math.floor(delta / minute)}m ago`;
  if (delta < day) return `${Math.floor(delta / hour)}h ago`;
  return `${Math.floor(delta / day)}d ago`;
};

const Header = ({ setSidebarOpen }) => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    const userId = userData?.id;
    if (!userId) {
      setNotifications([]);
      return;
    }

    try {
      const rows = await getUserNotifications(userId);
      setNotifications(rows || []);
    } catch {
      setNotifications([]);
    }
  }, [userData]);

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      loadNotifications();
    }, 0);

    const intervalId = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(intervalId);
    };
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      clearSelectedRole();
      navigate("/login");
    } catch {
      await Swal.error("Sign Out Failed", "Unable to sign out right now.");
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item
          )
        );
      }
      if (notification.link) {
        navigate(notification.link);
      }
    } catch {
      await Swal.error("Action Failed", "Could not open notification.");
    }
  };

  const handleMarkAllRead = async () => {
    if (!userData?.id || !unreadCount) return;
    try {
      await markAllNotificationsAsRead(userData.id);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch {
      await Swal.error("Update Failed", "Could not mark notifications as read.");
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Menu as="div" className="relative">
            <Menu.Button className="relative -m-2.5 rounded-full p-2.5 text-gray-400 hover:text-gray-500">
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              {unreadCount ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5 focus:outline-none sm:w-96">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-300"
                    disabled={!unreadCount}
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length ? (
                    notifications.map((item) => (
                      <Menu.Item key={item.id}>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={() => handleNotificationClick(item)}
                            className={classNames(
                              "w-full border-b border-gray-100 px-4 py-3 text-left",
                              active ? "bg-gray-50" : "bg-white"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={classNames("text-sm", item.isRead ? "text-gray-700" : "font-semibold text-gray-900")}>
                                  {item.title || "Notification"}
                                </p>
                                <p className="mt-1 text-xs text-gray-600">{item.message || ""}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {!item.isRead ? <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" /> : null}
                                <span className="text-[11px] text-gray-400">
                                  {formatRelativeTime(item.createdAt)}
                                </span>
                              </div>
                            </div>
                          </button>
                        )}
                      </Menu.Item>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <img
                className="h-8 w-8 rounded-full bg-gray-50"
                src={userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.fullName || "User"}&background=random`}
                alt=""
              />
              <span className="hidden lg:flex lg:items-center">
                <span
                  className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                  aria-hidden="true"
                >
                  {userData?.fullName || userData?.email}
                </span>
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={classNames(
                        active ? "bg-gray-50" : "",
                        "block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900"
                      )}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Header;
