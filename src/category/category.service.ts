import { Inject, Injectable } from 'graphst';
import { DataSource, In } from 'typeorm';
import DataLoader from 'dataloader';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  @Inject(() => DataSource)
  dataSource!: DataSource;

  getCategoryByIdLoader: DataLoader<string, Category | null>;

  constructor() {
    this.getCategoryByIdLoader = new DataLoader(
      this._getCategoryLabel.bind(this),
      {
        cache: false,
      }
    );
  }

  async _getCategoryLabel(
    ids: readonly string[]
  ): Promise<(Category | null)[]> {
    const posts = await this.dataSource.manager.find(Category, {
      where: {
        id: In([...new Set(ids)]),
      },
    });

    return ids.map((id) => posts.find((post) => `${post.id}` === id) || null);
  }

  async getAllCategories() {
    return this.dataSource.manager.find(Category);
  }

  async addCategory(label: string) {
    return this.dataSource.manager.save(Category, {
      label,
    });
  }

  async deleteCategory(id: string) {
    return this.dataSource.manager.delete(Category, {
      id,
    });
  }
}
