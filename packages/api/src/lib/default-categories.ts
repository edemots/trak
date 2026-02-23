import { db } from "@trak/db";
import { userToBankAccount } from "@trak/db/schema/bank-account";
import { category, group } from "@trak/db/schema/category";
import { eq } from "drizzle-orm";

type GroupTemplate = {
  icon: string;
  name: string;
};

type CategoryTemplate = {
  default: boolean;
  groupIcon: string;
  groupName: string;
  icon: string;
  name: string;
};

const DEFAULT_GROUP_TEMPLATES: GroupTemplate[] = [
  { name: "Quotidien", icon: "🛒" },
  { name: "Logement", icon: "🏠️" },
  { name: "Loisirs", icon: "🎮️" },
  { name: "Voiture / Moto", icon: "🏍️" },
  { name: "Abonnements / tel", icon: "📱" },
  { name: "Cadeaux", icon: "🎁" },
  { name: "Épargne", icon: "💰️" },
  { name: "Famille", icon: "🧑‍🧑‍🧒" },
  { name: "Retrait cash", icon: "🏧" },
  { name: "Santé", icon: "💊" },
  { name: "Voyage", icon: "🛩️" },
  { name: "Hors catégorie", icon: "❔️" },
];

const DEFAULT_CATEGORY_TEMPLATES: CategoryTemplate[] = [
  { groupName: "Quotidien", groupIcon: "🛒", name: "Autre", icon: "📂", default: true },
  { groupName: "Quotidien", groupIcon: "🛒", name: "Alimentation", icon: "🍎", default: false },
  { groupName: "Logement", groupIcon: "🏠️", name: "Autre", icon: "📂", default: true },
  { groupName: "Loisirs", groupIcon: "🎮️", name: "Autre", icon: "📂", default: true },
  { groupName: "Voiture / Moto", groupIcon: "🏍️", name: "Autre", icon: "📂", default: true },
  { groupName: "Abonnements / tel", groupIcon: "📱", name: "Autre", icon: "📂", default: true },
  { groupName: "Épargne", groupIcon: "💰️", name: "Autre", icon: "📂", default: true },
  { groupName: "Famille", groupIcon: "🧑‍🧑‍🧒", name: "Autre", icon: "📂", default: true },
  { groupName: "Santé", groupIcon: "💊", name: "Autre", icon: "📂", default: true },
  { groupName: "Voyage", groupIcon: "🛩️", name: "Autre", icon: "📂", default: true },
  {
    groupName: "Abonnements / tel",
    groupIcon: "📱",
    name: "Internet, TV",
    icon: "🌐",
    default: false,
  },
  {
    groupName: "Abonnements / tel",
    groupIcon: "📱",
    name: "Abonnements",
    icon: "📺️",
    default: false,
  },
  {
    groupName: "Abonnements / tel",
    groupIcon: "📱",
    name: "Téléphone",
    icon: "📱",
    default: false,
  },
  { groupName: "Cadeaux", groupIcon: "🎁", name: "Cadeaux", icon: "🎁", default: false },
  {
    groupName: "Famille",
    groupIcon: "🧑‍🧑‍🧒",
    name: "Crèche, nounou, babysitter",
    icon: "🚼️",
    default: false,
  },
  {
    groupName: "Hors catégorie",
    groupIcon: "❔️",
    name: "Hors catégorie",
    icon: "❔️",
    default: false,
  },
  {
    groupName: "Voiture / Moto",
    groupIcon: "🏍️",
    name: "Assurances",
    icon: "🛡️",
    default: false,
  },
  {
    groupName: "Voiture / Moto",
    groupIcon: "🏍️",
    name: "Carburant",
    icon: "⛽️",
    default: false,
  },
  {
    groupName: "Voiture / Moto",
    groupIcon: "🏍️",
    name: "Contraventions",
    icon: "👮",
    default: false,
  },
  {
    groupName: "Voiture / Moto",
    groupIcon: "🏍️",
    name: "Entretien",
    icon: "🔧",
    default: false,
  },
  {
    groupName: "Voiture / Moto",
    groupIcon: "🏍️",
    name: "Financement",
    icon: "💶",
    default: false,
  },
  { groupName: "Voiture / Moto", groupIcon: "🏍️", name: "Parking", icon: "🅿️", default: false },
  { groupName: "Voiture / Moto", groupIcon: "🏍️", name: "Péages", icon: "🚦", default: false },
  { groupName: "Logement", groupIcon: "🏠️", name: "Assurance", icon: "🛡️", default: false },
  { groupName: "Logement", groupIcon: "🏠️", name: "Energie", icon: "⚡️", default: false },
  {
    groupName: "Logement",
    groupIcon: "🏠️",
    name: "Loyer, charge",
    icon: "🏠️",
    default: false,
  },
  {
    groupName: "Loisirs",
    groupIcon: "🎮️",
    name: "Restaurant, bar...",
    icon: "🍸️",
    default: false,
  },
  {
    groupName: "Loisirs",
    groupIcon: "🎮️",
    name: "Culture (ciné, concert...)",
    icon: "🎟️",
    default: false,
  },
  { groupName: "Quotidien", groupIcon: "🛒", name: "Animaux", icon: "🐈‍⬛", default: false },
  {
    groupName: "Quotidien",
    groupIcon: "🛒",
    name: "Bien-être, soins",
    icon: "💈",
    default: false,
  },
  { groupName: "Quotidien", groupIcon: "🛒", name: "Shopping", icon: "🛍️", default: false },
  {
    groupName: "Logement",
    groupIcon: "🏠️",
    name: "Travaux, bricolage, jardinage",
    icon: "🔨",
    default: false,
  },
  {
    groupName: "Logement",
    groupIcon: "🏠️",
    name: "Mobilier, électroménager, déco...",
    icon: "🛋️",
    default: false,
  },
  {
    groupName: "Retrait cash",
    groupIcon: "🏧",
    name: "Retrait cash",
    icon: "🏧",
    default: false,
  },
  { groupName: "Santé", groupIcon: "💊", name: "Médecins", icon: "🧑‍⚕️", default: false },
  {
    groupName: "Santé",
    groupIcon: "💊",
    name: "Optique, audition...",
    icon: "👓️",
    default: false,
  },
  {
    groupName: "Santé",
    groupIcon: "💊",
    name: "Pharmacie & labo",
    icon: "🔬",
    default: false,
  },
  { groupName: "Voyage", groupIcon: "🛩️", name: "Hébergement", icon: "🏨", default: false },
  {
    groupName: "Voyage",
    groupIcon: "🛩️",
    name: "Location véhicule",
    icon: "🚙",
    default: false,
  },
  { groupName: "Voyage", groupIcon: "🛩️", name: "Taxis", icon: "🚕", default: false },
  {
    groupName: "Voyage",
    groupIcon: "🛩️",
    name: "Transports (Avion, train...)",
    icon: "🛩️",
    default: false,
  },
  {
    groupName: "Voyage",
    groupIcon: "🛩️",
    name: "Transports quotidiens (métro, bus)",
    icon: "🚈",
    default: false,
  },
  {
    groupName: "Épargne",
    groupIcon: "💰️",
    name: "Épargne bancaire",
    icon: "💰️",
    default: false,
  },
  {
    groupName: "Épargne",
    groupIcon: "💰️",
    name: "Épargne financière",
    icon: "📈",
    default: false,
  },
  {
    groupName: "Épargne",
    groupIcon: "💰️",
    name: "Placements boursiers",
    icon: "📈",
    default: false,
  },
  {
    groupName: "Logement",
    groupIcon: "🏠️",
    name: "Emprunt immo",
    icon: "🏦",
    default: false,
  },
];

const buildKey = (name: string, icon: string): string => `${name}::${icon}`;

export async function seedDefaultCategoriesForBankAccount(
  bankAccountId: number,
): Promise<void> {
  await db.transaction(async (tx) => {
    const owner = await tx
      .select({
        userId: userToBankAccount.userId,
      })
      .from(userToBankAccount)
      .where(eq(userToBankAccount.bankAccountId, bankAccountId))
      .limit(1)
      .get();

    if (!owner?.userId) {
      return;
    }

    const groupsForAccount = await tx
      .select({
        icon: group.icon,
        id: group.id,
        name: group.name,
      })
      .from(group)
      .where(eq(group.bankAccountId, bankAccountId))
      .all();

    const groupIdByKey = new Map<string, number>(
      groupsForAccount.map((g) => [buildKey(g.name, g.icon), g.id]),
    );

    for (const groupTemplate of DEFAULT_GROUP_TEMPLATES) {
      const key = buildKey(groupTemplate.name, groupTemplate.icon);
      if (groupIdByKey.has(key)) {
        continue;
      }

      const [insertedGroup] = await tx
        .insert(group)
        .values({
          userId: owner.userId,
          bankAccountId,
          icon: groupTemplate.icon,
          name: groupTemplate.name,
        })
        .returning({
          id: group.id,
        });

      if (insertedGroup) {
        groupIdByKey.set(key, insertedGroup.id);
      }
    }

    const categoriesForAccount = await tx
      .select({
        categoryIcon: category.icon,
        categoryName: category.name,
        groupId: category.groupId,
      })
      .from(category)
      .innerJoin(group, eq(group.id, category.groupId))
      .where(eq(group.bankAccountId, bankAccountId))
      .all();

    const existingCategoryKeySet = new Set<string>(
      categoriesForAccount.map((c) => `${c.groupId}::${buildKey(c.categoryName, c.categoryIcon)}`),
    );

    for (const categoryTemplate of DEFAULT_CATEGORY_TEMPLATES) {
      const groupId = groupIdByKey.get(
        buildKey(categoryTemplate.groupName, categoryTemplate.groupIcon),
      );

      if (!groupId) {
        continue;
      }

      const categoryKey = `${groupId}::${buildKey(categoryTemplate.name, categoryTemplate.icon)}`;
      if (existingCategoryKeySet.has(categoryKey)) {
        continue;
      }

      await tx.insert(category).values({
        default: categoryTemplate.default,
        groupId,
        icon: categoryTemplate.icon,
        name: categoryTemplate.name,
      });

      existingCategoryKeySet.add(categoryKey);
    }
  });
}
