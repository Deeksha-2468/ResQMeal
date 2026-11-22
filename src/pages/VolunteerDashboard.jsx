import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import AuthPanel from "../components/AuthPanel.jsx";
import VolunteerTaskList from "../components/VolunteerTaskList.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  listOpenVolunteerTasks,
  listMyVolunteerTasks,
  acceptDonation,
  markCollected,
  markDelivered,
  summariseDeliveries,
} from "../lib/volunteer.js";

const TASK_RACE_MESSAGE =
  "That task was just taken or its status changed. The list has been refreshed.";

const ACTIONS = {
  accept: acceptDonation,
  collected: markCollected,
  delivered: markDelivered,
};

export default function VolunteerDashboard() {
  const { user, loading, configured } = useAuth();
  const userId = user?.id;
  const [openTasks, setOpenTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const loadLists = useCallback(async () => {
    if (!userId) return;
    setListsLoading(true);
    setLoadError("");
    try {
      const [open, mine] = await Promise.all([listOpenVolunteerTasks(), listMyVolunteerTasks()]);
      setOpenTasks(open);
      setMyTasks(mine);
    } catch (err) {
      setLoadError(err.message || "Tasks could not be loaded.");
    } finally {
      setListsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const handleAction = async (type, taskId) => {
    const run = ACTIONS[type];
    if (!run) return;
    setBusyId(taskId);
    setActionError("");
    try {
      await run(taskId);
    } catch (err) {
      const message = String(err?.message ?? "");
      setActionError(
        message.includes("no longer")
          ? TASK_RACE_MESSAGE
          : message || "Action failed. Please try again.",
      );
    } finally {
      setBusyId(null);
    }
    await loadLists();
  };

  const assigned = myTasks.filter((task) => task.status !== "delivered");
  const completed = myTasks.filter((task) => task.status === "delivered");
  const impact = summariseDeliveries(myTasks);

  return (
    <>
      <PageHeader title="Volunteer dashboard" accent="accent-volunteer" />

      {!configured ? (
        <section className="page-section">
          <p className="note" role="alert">
            Supabase is not configured in this environment. Set VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY, then restart the dev server, to see and manage pickup tasks.
          </p>
        </section>
      ) : loading ? (
        <section className="page-section">
          <p className="hint" role="status">Checking your session...</p>
        </section>
      ) : !user ? (
        <section className="page-section">
          <AuthPanel />
        </section>
      ) : (
        <>
          {loadError && (
            <section className="page-section">
              <p className="rm-field-error" role="alert">
                {loadError}
              </p>
            </section>
          )}

          {actionError && (
            <section className="page-section">
              <p className="rm-field-error" role="alert">
                {actionError}
              </p>
            </section>
          )}

          <section className="page-section">
            <h2>Assigned pickups</h2>
            {listsLoading ? (
              <p className="hint" role="status">Loading assigned pickups...</p>
            ) : (
              <VolunteerTaskList
                items={assigned}
                mode="mine"
                onAction={handleAction}
                busyId={busyId}
                emptyText="No assigned pickups"
                emptyMessage="Pickups assigned to you will be listed here."
              />
            )}
          </section>

          <section className="page-section">
            <h2>Available pickup tasks</h2>
            {listsLoading ? (
              <p className="hint" role="status">Loading open tasks...</p>
            ) : (
              <VolunteerTaskList
                items={openTasks}
                mode="open"
                onAction={handleAction}
                busyId={busyId}
                emptyText="No open tasks"
                emptyMessage="Pickup and delivery tasks needing a volunteer will appear here."
              />
            )}
          </section>

          <section className="page-section">
            <h2>Completed pickups</h2>
            {listsLoading ? (
              <p className="hint" role="status">Loading completed pickups...</p>
            ) : (
              <>
                <p className="disclaimer">
                  Delivered tasks: {impact.count}
                  {impact.byUnit.length > 0 &&
                    ` (${impact.byUnit.map(({ unit, quantity }) => `${quantity} ${unit}`).join(", ")})`}
                </p>
                <VolunteerTaskList
                  items={completed}
                  mode="done"
                  onAction={handleAction}
                  busyId={busyId}
                  emptyText="No completed pickups"
                  emptyMessage="Your finished pickups and deliveries will be recorded here."
                />
              </>
            )}
          </section>
        </>
      )}
    </>
  );
}
