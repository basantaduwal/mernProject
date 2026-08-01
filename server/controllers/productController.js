import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Helper: Build the full filesystem path of an uploaded product image
 */
const buildImagePath = (imagePath) => {
  return path.join(__dirname, '..', imagePath);
};

/**
 * Helper: Delete an image file from disk if it exists
 */
const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  const fullPath = buildImagePath(imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

/**
 * Get all products with optional search, category, and price filters
 * Route: GET /api/products
 * Access: Public
 */
export const getProducts = asyncHandler(async (req, res, next) => {
  const { keyword, category, minPrice, maxPrice } = req.query;

  const query = {};

  // Text search: Match keyword against name or description
  if (keyword && keyword.trim()) {
    query.$or = [
      { name: { $regex: keyword.trim(), $options: 'i' } },
      { description: { $regex: keyword.trim(), $options: 'i' } },
    ];
  }

  // Category filter
  if (category && category.trim()) {
    query.category = { $regex: category.trim(), $options: 'i' };
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
});

/**
 * Get single product by ID
 * Route: GET /api/products/:id
 * Access: Public
 */
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('createdBy', 'name email');

  if (!product) {
    return next(new ApiError(404, 'Product not found'));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

/**
 * Create a new product
 * Route: POST /api/products
 * Access: Private/Admin
 */
export const createProduct = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Product image is required'));
  }

  const { name, description, price, category, stock } = req.body;

  // Build relative image path stored in DB (served via /uploads static route)
  const imagePath = `/uploads/${req.file.filename}`;

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    category,
    stock: stock ? Number(stock) : 0,
    image: imagePath,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    product,
  });
});

/**
 * Update an existing product
 * Route: PUT /api/products/:id
 * Access: Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ApiError(404, 'Product not found'));
  }

  const { name, description, price, category, stock } = req.body;

  // If a new image was uploaded, delete the old one from disk
  if (req.file) {
    deleteImageFile(product.image);
    product.image = `/uploads/${req.file.filename}`;
  }

  // Update only provided fields
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (category !== undefined) product.category = category;
  if (stock !== undefined) product.stock = Number(stock);

  const updatedProduct = await product.save();

  res.status(200).json({
    success: true,
    product: updatedProduct,
  });
});

/**
 * Delete a product and remove its image from disk
 * Route: DELETE /api/products/:id
 * Access: Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ApiError(404, 'Product not found'));
  }

  // Delete image file from disk
  deleteImageFile(product.image);

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});
