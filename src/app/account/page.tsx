"use client";

import {
  ShoppingBag,
  ShoppingCart,
  MapPin,
  GraduationCap,
  Award,
  Map,
  Loader2,
  AlertCircle,
  Inbox,
  ChevronRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePricing } from "@/context/PricingContext";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomerDashboard, fetchMyRoleStatus } from "@/lib/api/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const AccountDashboard = () => {
  const { user } = useAuth();
  const { formatPrice } = usePricing();
  const { t } = useLanguage();

  const dashboardQuery = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: fetchCustomerDashboard,
  });

  const roleStatusQuery = useQuery({
    queryKey: ["user-role-status"],
    queryFn: fetchMyRoleStatus,
  });

  const statsData = dashboardQuery.data;
  const roleStatus = roleStatusQuery.data;

  const stats = [
    {
      label: t(translations.accountPage.totalOrders),
      value: statsData?.totalOrders.toString().padStart(2, "0") || "00",
      sub: `+${statsData?.monthlyOrders || 0} ${t(translations.accountPage.thisMonth)}`,
      icon: ShoppingBag,
      color: "bg-green-50 text-green-600",
      href: "/account/orders",
    },
    {
      label: t(translations.accountPage.itemsInCart),
      value: statsData?.cartItems.toString().padStart(2, "0") || "00",
      sub: t(translations.accountPage.readyForCheckout),
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
      href: "/cart",
    },
    {
      label: t(translations.accountPage.savedAddresses),
      value: statsData?.addressCount.toString().padStart(2, "0") || "00",
      sub: t({ en: "Direct delivery", rw: "Igenewe wowe", fr: "Livraison directe", sw: "Uwasilishaji wa moja kwa moja" }),
      icon: MapPin,
      color: "bg-amber-50 text-amber-600",
      href: "/account/addresses",
    },
    {
      label: t(translations.accountPage.myEnrollments),
      value: statsData?.totalEnrollments.toString().padStart(2, "0") || "00",
      sub: `${statsData?.inProgressEnrollments || 0} ${t(translations.accountPage.inProgress)}`,
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-600",
      href: "/account/enrollments",
    },
    {
      label: t(translations.accountPage.myCertificates),
      value: statsData?.certificateCount.toString().padStart(2, "0") || "00",
      sub: t(translations.accountPage.viewAll),
      icon: Award,
      color: "bg-indigo-50 text-indigo-600",
      href: "/account/certificates",
    },
    {
      label: t(translations.accountPage.myTours),
      value: statsData?.upcomingTours.toString().padStart(2, "0") || "00",
      sub: t(translations.accountPage.upcomingActivities),
      icon: Map,
      color: "bg-teal-50 text-teal-600",
      href: "/account/bookings",
    },
  ];

  const recentOrders = statsData?.recentOrders || [];

  if (dashboardQuery.isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">{t({ en: "Gathering your dashboard data...", rw: "Turimo gutegura imbonerahamwe yawe...", fr: "Collecte de vos données...", sw: "Tunakusanya data zako za dashibodi..." })}</p>
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive opacity-20" />
        <h3 className="text-lg font-bold">{t({ en: "Failed to load dashboard", rw: "Imbonerahamwe yanze gufunguka", fr: "Échec du chargement du tableau de bord", sw: "Imeshindwa kupakia dashibodi" })}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{t({ en: "We couldn't retrieve your account data. Please refresh or try again later.", rw: "Ntabwo twabashije kubona amakuru yawe. Ongera ugerageze.", fr: "Nous n'avons pas pu récupérer vos données. Veuillez réessayer.", sw: "Hatukuweza kupata data ya akaunti yako. Tafadhali pakia tena au jaribu baadaye." })}</p>
        <Button onClick={() => dashboardQuery.refetch()} variant="outline" size="sm">{t(translations.common.retry)}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Application Status Alerts */}
      {roleStatus && (roleStatus.partner.hasPendingApplication || roleStatus.artisan.hasPendingApplication) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
             <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
             <h3 className="text-sm font-bold text-amber-900">
                {roleStatus.partner.hasPendingApplication && roleStatus.artisan.hasPendingApplication 
                  ? t({ en: "Multiple Applications Pending", rw: "Ibisabwa byinshi birategereje", fr: "Plusieurs demandes en attente", sw: "Maombi Mengi Yanasubiri" })
                  : roleStatus.partner.hasPendingApplication 
                    ? t({ en: "Partner Application Pending", rw: "Gusaba kuba umufatanyabikorwa", fr: "Demande de partenariat en attente", sw: "Ombi la Ushirika Linasubiri" })
                    : t({ en: "Artisan Application Pending", rw: "Gusaba kuba umunyabugeni", fr: "Demande d'artisan en attente", sw: "Ombi la Sanaa Linasubiri" })}
             </h3>
             <p className="text-xs text-amber-700 mt-1">
                {t({ 
                   en: "Our team is currently reviewing your request. We will notify you once a decision is made.", 
                   rw: "Ikipe yacu irimo gusuzuma ubusabe bwawe. Tuzakumenyesha nibimara kwemezwa.",
                   fr: "Notre équipe examine actuellement votre demande. Nous vous informerons dès qu'une décision sera prise.",
                   sw: "Timu yetu inakagua ombi lako kwa sasa. Tutakujulisha uamuzi ukishatolewa."
                })}
             </p>
          </div>
          <Link href="/account/requests">
             <Button variant="outline" size="sm" className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100">
                {t(translations.accountPage.viewAll)}
             </Button>
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-primary overflow-hidden rounded-[20px] text-white p-8 md:p-12 relative shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 font-heading">
            {t(translations.accountPage.hello)}, {user?.username}!
          </h2>
          <p className="text-white/80 max-w-md text-sm leading-relaxed">
            {t(translations.accountPage.welcomeDesc)}
          </p>
          <div className="mt-6 flex gap-3">
             <Link href="/account/profile">
                <Button variant="secondary" size="sm" className="h-9 px-6 font-bold text-xs bg-white text-primary hover:bg-white/90">
                    {t(translations.accountPage.editProfile)}
                </Button>
             </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl text-xs" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <span className="absolute bottom-4 right-8 text-white/5 font-black text-9xl font-heading -rotate-12 hidden lg:block select-none pointer-events-none">
          AGRI
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Link href={stat.href} key={i}>
            <div
              className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
              <div>
                <h4 className="text-3xl font-black text-foreground font-heading">
                  {stat.value}
                </h4>
                <p className="text-[11px] text-muted-foreground font-bold mt-1 uppercase tracking-tight flex items-center gap-1">
                  {stat.sub}
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Orders Card */}
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between bg-card/10">
            <h3 className="text-sm font-black text-foreground font-heading uppercase tracking-wider">
              {t(translations.accountPage.recentOrders)}
            </h3>
            <Link
              href="/account/orders"
              className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
            >
              {t(translations.accountPage.viewFullHistory)}
            </Link>
          </div>
          <div className="flex-1">
            {recentOrders.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground/30">
                    <Inbox className="h-10 w-10" />
                    <p className="text-xs font-bold uppercase tracking-widest">{t(translations.accountPage.noOrdersYet)}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/30 text-muted-foreground uppercase text-[9px] font-extrabold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Amount</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                        {recentOrders.map((order, i) => (
                            <tr
                            key={i}
                            className="hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/account/orders/${order.id}`}
                            >
                            <td className="px-6 py-4 font-bold text-foreground">
                                {order.orderNumber}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground font-medium">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                                <Badge
                                className={`text-[9px] font-bold uppercase py-0 px-2.5 ${
                                    order.status === "delivered" || order.status === "completed"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-amber-100 text-amber-700 border-amber-200"
                                }`}
                                variant="outline"
                                >
                                {order.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 font-black text-primary text-sm">
                                {formatPrice(order.totalAmount)}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        </div>

        {/* Support & Community Card */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-border bg-card/10">
            <h3 className="text-sm font-black text-foreground font-heading uppercase tracking-wider">
              {t(translations.accountPage.quickResources)}
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {[
                { title: t({ en: "Track Request Status", rw: "Kurikirana Ibisabwa", fr: "Suivi des demandes", sw: "Fuatilia Hali ya Ombi" }), desc: t({ en: "Check school visits or partnership status", rw: "Reba uko gusura ibigo by'amashuri bihagaze", fr: "Vérifier le statut des visites scolaires", sw: "Angalia ziara za shule au hali ya ushirika" }), href: "/account/requests", icon: AlertCircle },
                { title: t({ en: "Continue Learning", rw: "Komeza Kwiga", fr: "Continuer l'apprentissage", sw: "Endelea Kujifunza" }), desc: t({ en: "Pick up where you left off in your courses", rw: "Komeza aho wari ugeze mu masomo yawe", fr: "Reprenez là où vous vous êtes arrêté", sw: "Anzia pale ulipoishia kwenye kozi zako" }), href: "/account/enrollments", icon: GraduationCap },
                { title: t(translations.accountPage.savedAddresses), desc: t({ en: "Manage your saved shipping locations", rw: "Genzura aho wagererwa n'ibyo waguze", fr: "Gérez vos adresses de livraison", sw: "Dhibiti maeneo yako ya usafirishaji yalihifadhiwa" }), href: "/account/addresses", icon: MapPin },
                { title: t({ en: "Help & Support", rw: "Ubufasha", fr: "Aide et support", sw: "Msaada na Usaidizi" }), desc: t({ en: "Need assistance? Contact our team", rw: "Ukeneye ubufasha? Twandikire", fr: "Besoin d'aide ? Contactez-nous", sw: "Unahitaji msaada? Wasiliana na timu yetu" }), href: "/contact", icon: AlertCircle },
            ].map((link, i) => (
                <Link
                key={i}
                href={link.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                >
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <link.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        {link.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {link.desc}
                    </p>
                </div>
                </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
