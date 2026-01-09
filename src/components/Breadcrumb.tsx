import { Link } from "wouter";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <div className={`ts-breadcrumb ${className}`}>
      <Link href="/" className="item">首頁</Link>
      {items.map((item, index) => (
        <Fragment key={index}>
          <div className="separator">/</div>
          {item.href ? (
            <Link href={item.href} className="item">{item.label}</Link>
          ) : (
            <span className="item">{item.label}</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
