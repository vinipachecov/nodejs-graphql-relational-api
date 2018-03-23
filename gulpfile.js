/** TASKS FILE */

const gulp = require('gulp');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

/*
task
- name
- dependencies
- function
 */

//lógica de automação
gulp.task('scripts', ['static'], () => {
  const tsResult = tsProject.src()
  // to do a operation in this point
    .pipe(tsProject());

  tsResult.js
    .pipe(gulp.dest('dist'));
});


// json files...
gulp.task('static', ['clean'], () => {
  return gulp
    .src(['src/**/*.json'])
    .pipe(gulp.dest('dist'));
});

//Responsable for cleaning the dist folder
gulp.task('clean', () => {
  return gulp
    .src('dist')
    .pipe(clean());
});

// call the other tasks in a specific order
gulp.task('build', ['scripts']);

gulp.task('watch', ['build'], () => {
  return gulp.watch(['src/**/*.ts', 'src/**/*.json'], ['build']);
});


gulp.task('default', ['watch']);