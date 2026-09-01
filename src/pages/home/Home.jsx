import { useQuery } from "@tanstack/react-query";
import { getUserStats } from "../../services/api/users";
import styles from "./Home.module.css";

const SIX_HOURS = 6 * 60 * 60 * 1000;

function Home() {
  const {
    data: stats = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStats,
    staleTime: SIX_HOURS,
    gcTime: SIX_HOURS,
  });

  const usersByType = stats.users_by_type ?? {};
  const getTileValue = (value) => {
    if (isLoading) return "...";
    if (isError) return "-";

    return value ?? 0;
  };

  return (
    <section className={styles.home}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
      </div>

      <div className={styles.tileGrid}>
        <article className={styles.tile}>
          <span className={styles.tileLabel}>Total Users</span>
          <strong className={styles.tileValue}>
            {getTileValue(stats.total_users)}
          </strong>
        </article>

        <article className={styles.tile}>
          <span className={styles.tileLabel}>Customer</span>
          <strong className={styles.tileValue}>
            {getTileValue(usersByType.customer)}
          </strong>
        </article>

        <article className={styles.tile}>
          <span className={styles.tileLabel}>Seller</span>
          <strong className={styles.tileValue}>
            {getTileValue(usersByType.seller)}
          </strong>
        </article>

        <article className={styles.tile}>
          <span className={styles.tileLabel}>Delivery Partner</span>
          <strong className={styles.tileValue}>
            {getTileValue(usersByType.delivery_partner)}
          </strong>
        </article>

        <article className={styles.tile}>
          <span className={styles.tileLabel}>Total Shops</span>
          <strong className={styles.tileValue}>
            {getTileValue(stats.total_shops)}
          </strong>
        </article>
      </div>
    </section>
  );
}

export default Home;
